#!/bin/bash
# The home hero film: six free Mixkit clips (Mixkit licence, commercial use allowed), stand-ins credited in the footer.
# Downloads them, cuts 4.2 s from each, grades them into AIMS night greens with a slow push-in, joins them with 0.8 s
# dissolves into a seamless 20.4 s loop, and writes the web cuts to public/video. Run from video/stock.
set -e
mkdir -p hd
for i in 20211 33956 21821 23282 22997; do curl -sL -o hd/$i.mp4 https://assets.mixkit.co/videos/$i/$i-720.mp4; done
curl -sL -o hd/41180.mp4 https://assets.mixkit.co/videos/41180/41180-1080.mp4
L=4.2; D=0.8; W=1600; H=900
clip() { # id start extra-eq
  ffmpeg -loglevel error -y -ss $2 -t $L -i hd/$1.mp4 -an -vf "fps=30,scale=w='trunc(${W}*(1+0.07*t/${L})/2)*2':h=-2:eval=frame:flags=lanczos,crop=${W}:${H},setsar=1${HF},eq=contrast=1.08:saturation=0.78${3},colorbalance=rs=-0.10:gs=0.03:bs=-0.05:rm=-0.07:gm=0.04:bm=-0.06:rh=-0.04:gh=0.02:bh=-0.05,format=yuv420p" -c:v libx264 -crf 14 -preset fast g$1.mp4
}
clip 20211 0.4 ":brightness=-0.03"
clip 33956 1.5 ":brightness=-0.16:gamma=0.85"
HF=",hflip" clip 21821 0.1 ":brightness=0.04"
clip 41180 2.0 ":brightness=-0.06:saturation=0.55"
clip 22997 2.0 ":brightness=-0.02"
clip 23282 3.0 ":brightness=-0.05"
S=3.4
ffmpeg -loglevel error -y -i g20211.mp4 -i g33956.mp4 -i g21821.mp4 -i g41180.mp4 -i g22997.mp4 -i g23282.mp4 -i g20211.mp4 -filter_complex "\
[0][1]xfade=transition=fade:duration=$D:offset=$S[a];\
[a][2]xfade=transition=fade:duration=$D:offset=6.8[b];\
[b][3]xfade=transition=fade:duration=$D:offset=10.2[c];\
[c][4]xfade=transition=fade:duration=$D:offset=13.6[d];\
[d][5]xfade=transition=fade:duration=$D:offset=17.0[e];\
[e][6]xfade=transition=fade:duration=$D:offset=20.4,trim=start=0.8:end=21.2,setpts=PTS-STARTPTS,vignette=PI/5[v]" -map "[v]" -c:v libx264 -crf 14 -preset slow master.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 master.mp4
ffmpeg -loglevel error -y -i master.mp4 -vf scale=1280:-2:flags=lanczos -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../../public/video/hero-film.mp4
ffmpeg -loglevel error -y -i master.mp4 -vf scale=854:-2:flags=lanczos -c:v libx264 -crf 31 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../../public/video/hero-film-sm.mp4
ffmpeg -loglevel error -y -ss 1 -i master.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 60 ../../public/video/hero-film-poster.webp
