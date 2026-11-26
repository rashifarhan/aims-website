"""Cut a rendered journey film (MP4) back into numbered stills with Blender's video editor, no 3D render:

  /Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/movie_to_frames.py -- --movie 3d/renders/journey/journey-0001-1920.mp4 --out /tmp/journey-stills

Stills come out as 0001.jpg, 0002.jpg … one per frame of the movie; 3d/frames_to_web.py renames them to film
frame numbers and makes the web set. (The final film is rendered straight to stills and skips this step.)
"""

import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
opts = dict(zip(argv[0::2], argv[1::2]))
movie, out = os.path.abspath(opts["--movie"]), os.path.abspath(opts["--out"])
os.makedirs(out, exist_ok=True)

sc = bpy.context.scene
ed = sc.sequence_editor_create()
strips = ed.strips if hasattr(ed, "strips") else ed.sequences  # renamed in recent Blender versions
strip = strips.new_movie("film", movie, 1, 1)
sc.frame_start, sc.frame_end = 1, strip.frame_final_end - 1
sc.render.resolution_x, sc.render.resolution_y = strip.elements[0].orig_width, strip.elements[0].orig_height
sc.render.resolution_percentage = 100
settings = sc.render.image_settings
if hasattr(settings, "media_type"):  # Blender 5 splits image and video output
    settings.media_type = "IMAGE"
settings.file_format, settings.quality = "JPEG", 92
sc.render.use_sequencer = True
sc.render.filepath = os.path.join(out, "")
bpy.ops.render.render(animation=True)
print("STILLS_WRITTEN", sc.frame_end, out)
