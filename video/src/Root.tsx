import { Composition } from "remotion";
import { FaceCheckIn } from "./FaceCheckIn";
import { HeroReel, LOOP } from "./HeroReel";

export const Root = () => (
  <>
    <Composition id="hero-reel" component={HeroReel} durationInFrames={LOOP} fps={30} width={1920} height={1080} />
    <Composition id="face-check-in" component={FaceCheckIn} durationInFrames={180} fps={30} width={1920} height={1080} />
  </>
);
