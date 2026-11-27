# Product cut-outs (direction 2)

The stage photographs in `public/images/cutouts/` are AIMS's own product photos, lifted off their white studio
backgrounds with Apple's Vision subject lift (the model behind "Lift subject" in Photos; on device, macOS 14+), then
cleaned for a dark ground. It replaces `../cutout.py`, whose flood fill left a white rim and kept glass milky.

```bash
swiftc -O lift.swift -o lift
./lift ../../../public/images/products/<slug>.webp raw.png
python3 finish.py raw.png ../../../public/images/cutouts/<name>.png [left|right|all]
```

`finish.py` (numpy, Pillow) keeps one view when a photo shows two (`left`/`right`), removes the white the soft edge
picked up from the background, and tightens the edge. Check each result on a dark ground before using it. Vision
finds no subject in `inbio-pro-260`; that file is still the older cut.
