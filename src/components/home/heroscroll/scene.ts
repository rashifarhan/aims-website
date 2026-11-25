import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { facePoints } from "./face";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, a: number, b: number) => {
  const x = clamp01((p - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/** The story along the scroll (0 → 1): tighten, scan, verify, burst into light. */
export function phases(p: number) {
  return {
    form: 0.965 + 0.035 * ramp(p, 0, 0.16),
    scanOn: ramp(p, 0.16, 0.2) * (1 - ramp(p, 0.54, 0.6)),
    scanY: 1.25 - 2.5 * ramp(p, 0.18, 0.52),
    verify: ramp(p, 0.5, 0.6) * (1 - ramp(p, 0.8, 0.9)),
    out: ramp(p, 0.68, 1),
    turn: -0.5 + 0.5 * ramp(p, 0, 0.26),
  };
}

const vertex = /* glsl */ `
  attribute vec3 aCloud;
  attribute float aRand;
  attribute float aShade;
  uniform float uTime, uForm, uScan, uScanOn, uVerify, uOut, uSize, uPixelRatio, uGain;
  uniform vec3 uBase, uLime, uWhite;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = mix(aCloud, position, uForm);
    float loose = 1.0 + (1.0 - uForm) * 10.0;
    p += vec3(sin(uTime * 0.8 + aRand * 31.0), cos(uTime * 0.7 + aRand * 17.0), sin(uTime * 0.6 + aRand * 11.0)) * 0.012 * loose;
    vec3 dir = normalize(position + vec3(0.0, 0.0, 0.5));
    p += dir * uOut * (1.2 + aRand * 4.5) + vec3(0.0, 0.0, uOut * aRand * 2.5);
    float scanned = step(uScan, position.y) * uScanOn;
    float band = exp(-pow((position.y - uScan) * 16.0, 2.0)) * uScanOn;
    vColor = (mix(uBase, uLime, max(scanned * 0.75, uVerify)) + uWhite * band * 0.8 + uWhite * uVerify * 0.25) * (0.35 + 1.25 * aShade * aShade);
    // Each point adds only a little light: dense features glow, edges sparkle (additive blending).
    vAlpha = uGain * (0.45 + 0.55 * aRand) * (1.0 - uOut * 0.6) * (1.0 + band * 1.5);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aRand * 0.9) * (1.0 + band * 0.7 + uVerify * 0.3) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
  }
`;

export type HeroScene = {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
};

export function createHeroScene(
  canvas: HTMLCanvasElement,
  opts: { count: number; still: boolean; colors: { base: string; lime: string } },
): HeroScene {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  // Light on black, screened onto the page's own night gradient (hero-scroll.css): dark stays exactly the brand's.
  renderer.setClearColor(new Color(0, 0, 0), 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  const { face, cloud, rand, shade } = facePoints(opts.count);
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(face, 3));
  geo.setAttribute("aCloud", new BufferAttribute(cloud, 3));
  geo.setAttribute("aRand", new BufferAttribute(rand, 1));
  geo.setAttribute("aShade", new BufferAttribute(shade, 1));
  const uniforms = {
    uTime: { value: 0 },
    uForm: { value: opts.still ? 1 : 0.25 },
    uScan: { value: 1.25 },
    uScanOn: { value: 0 },
    uVerify: { value: 0 },
    uOut: { value: 0 },
    uSize: { value: 15 },
    uGain: { value: 0.22 },
    uPixelRatio: { value: dpr },
    uBase: { value: new Color(opts.colors.base).lerp(new Color(opts.colors.lime), 0.35) },
    uLime: { value: new Color(opts.colors.lime) },
    uWhite: { value: new Color("#ffffff") },
  };
  const mat = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const head = new Group();
  head.add(new Points(geo, mat));

  const scanMat = new MeshBasicMaterial({
    color: new Color(opts.colors.lime),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const scanBar = new Mesh(new PlaneGeometry(2.3, 0.012), scanMat);
  scanBar.position.z = 0.75;
  head.add(scanBar);
  const ringMat = new MeshBasicMaterial({
    color: new Color(opts.colors.lime),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const ring = new Mesh(new RingGeometry(1.42, 1.442, 160), ringMat);
  head.add(ring);
  scene.add(head);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.85, 0.5, 0.12);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let target = opts.still ? 0.56 : 0;
  let current = target;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let width = 0;
  let height = 0;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Beside the copy on wide screens, above it on narrow ones.
    const wide = w / h > 1.15;
    head.position.set(wide ? 1.15 : 0, wide ? 0 : 0.55, 0);
    head.scale.setScalar(wide ? 1 : 0.82);
  };
  resize();

  let start = performance.now();
  let frame = 0;
  const render = (now: number) => {
    resize();
    const t = (now - start) / 1000;
    current += (target - current) * 0.12;
    const ph = phases(current);
    // The face gathers within a second of load, so the stage is alive before any scroll.
    const intro = opts.still ? 1 : 1 - (1 - clamp01(t / 1.4)) ** 3;
    uniforms.uTime.value = t;
    uniforms.uForm.value = 0.25 + (ph.form - 0.25) * intro;
    uniforms.uScan.value = ph.scanY;
    uniforms.uScanOn.value = ph.scanOn;
    uniforms.uVerify.value = ph.verify;
    uniforms.uOut.value = ph.out;
    scanBar.position.y = ph.scanY;
    scanMat.opacity = ph.scanOn * 0.7;
    ringMat.opacity = ph.verify * 0.85;
    ring.scale.setScalar(0.86 + 0.14 * ph.verify);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    head.rotation.y = ph.turn + pointer.x * 0.35 + (opts.still ? 0 : Math.sin(t * 0.35) * 0.06);
    head.rotation.x = pointer.y * 0.18;
    composer.render();
    if (!opts.still) frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  return {
    setProgress(p) {
      target = clamp01(p);
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    dispose() {
      cancelAnimationFrame(frame);
      geo.dispose();
      mat.dispose();
      scanMat.dispose();
      ringMat.dispose();
      composer.dispose();
      renderer.dispose();
      start = 0;
    },
  };
}
