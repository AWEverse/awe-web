import React from "react";

import { VideoPlayer } from "@/widgets/video-player";

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: "5rem" }}>
      <VideoPlayer
        audioVolume={0}
        isAudioMuted={false}
        playbackSpeed={0}
        totalFileSize={0}
      />
    </div>
  );
};

export default TestPage;
