import { Composition } from "remotion";
import { FaceCheckIn } from "./FaceCheckIn";

export const Root = () => (
  <>
    <Composition id="face-check-in" component={FaceCheckIn} durationInFrames={180} fps={30} width={1920} height={1080} />
  </>
);
