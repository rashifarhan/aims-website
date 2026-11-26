import { loadOrder } from "@/lib/journey/frames";

/**
 * Downloads the film's frames coarse to fine (with the reader's own place jumping the queue) and keeps them as
 * compressed blobs; decodes only the frames being drawn, in a small LRU, because ~1000 decoded frames would
 * hold gigabytes of memory.
 */
export class FrameStore {
  private blobs = new Map<number, Blob>();
  private decoded = new Map<number, ImageBitmap>();
  private decoding = new Map<number, Promise<ImageBitmap | null>>();
  private inflight = new Set<number>();
  private order: number[];
  private pos = 0;
  private priority: number[] = [];
  private stopped = false;

  constructor(
    private src: (frame: number) => string,
    available: number[],
    private onLoad: (frame: number) => void,
    private maxRequests = 6,
    private maxDecoded = 40,
  ) {
    this.order = loadOrder(available);
  }

  has = (frame: number) => this.blobs.has(frame);

  /** A decoded frame if it is ready now; otherwise starts decoding it and returns undefined. */
  bitmap(frame: number): ImageBitmap | undefined {
    const ready = this.decoded.get(frame);
    if (ready) {
      this.decoded.delete(frame); // refresh its place in the LRU
      this.decoded.set(frame, ready);
      return ready;
    }
    void this.decode(frame);
    return undefined;
  }

  /** Fetch these frames next (nearest the reader first), ahead of the coarse-to-fine queue. */
  focus(frames: number[]) {
    this.priority = frames.filter((f) => !this.blobs.has(f) && !this.inflight.has(f));
    for (const f of frames.slice(0, 6)) if (this.blobs.has(f)) void this.decode(f);
    this.pump();
  }

  start() {
    this.pump();
  }

  stop() {
    this.stopped = true;
    for (const bitmap of this.decoded.values()) bitmap.close();
    this.decoded.clear();
  }

  decode(frame: number): Promise<ImageBitmap | null> {
    const blob = this.blobs.get(frame);
    if (!blob || this.decoded.has(frame)) return Promise.resolve(this.decoded.get(frame) ?? null);
    const pending = this.decoding.get(frame);
    if (pending) return pending;
    const job = createImageBitmap(blob)
      .then((bitmap) => {
        if (this.stopped) {
          bitmap.close();
          return null;
        }
        this.decoded.set(frame, bitmap);
        while (this.decoded.size > this.maxDecoded) {
          const oldest = this.decoded.keys().next().value;
          if (oldest === undefined) break;
          this.decoded.get(oldest)?.close();
          this.decoded.delete(oldest);
        }
        this.onLoad(frame);
        return bitmap;
      })
      .catch(() => null)
      .finally(() => this.decoding.delete(frame));
    this.decoding.set(frame, job);
    return job;
  }

  private next(): number | undefined {
    while (this.priority.length) {
      const f = this.priority.shift();
      if (f !== undefined && !this.blobs.has(f) && !this.inflight.has(f)) return f;
    }
    while (this.pos < this.order.length) {
      const f = this.order[this.pos++];
      if (f !== undefined && !this.blobs.has(f) && !this.inflight.has(f)) return f;
    }
    return undefined;
  }

  private pump() {
    while (!this.stopped && this.inflight.size < this.maxRequests) {
      const frame = this.next();
      if (frame === undefined) return;
      void this.fetch(frame);
    }
  }

  private async fetch(frame: number) {
    this.inflight.add(frame);
    try {
      const res = await fetch(this.src(frame));
      if (res.ok && !this.stopped) {
        this.blobs.set(frame, await res.blob());
        this.onLoad(frame);
      }
    } catch {
      // A missing frame is skipped: the player draws the nearest one it has (responsiveness rules).
    } finally {
      this.inflight.delete(frame);
      this.pump();
    }
  }
}
