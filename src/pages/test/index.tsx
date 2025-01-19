import { useEffect, useState } from "react";
import "./styles.scss";
import { marked, Tokens } from "marked";
import DOMPurify from "dompurify";

import MoonPhases from "@/shared/common/MoonPhases";
import VideoPlayer from "@/widgets/video-player/public/ui/VideoPlayer";
import SeekLine from "@/widgets/video-player/private/ui/SeekLine";
import { Lethargy } from "@/lib/utils/lethargy";

const ScrollDemo: React.FC = () => {
  const [intent, setIntent] = useState<"None" | "Scrolling" | "Inertia">(
    "None",
  );
  const [inertia, setInertia] = useState<string>("Inactive");
  const lethargy = new Lethargy({
    stability: 8,
    sensitivity: 100,
    tolerance: 1.1,
    delay: 150,
  });

  const handleWheel = (e: WheelEvent) => {
    console.log(lethargy);

    const isInertia = lethargy.check(e);
    if (isInertia === false) {
      setIntent("Scrolling");
      setInertia("Intent");
    } else if (isInertia) {
      setIntent("Scrolling");
      setInertia("Inertial");
    } else {
      setIntent("None");
    }
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  return (
    <div>
      <div
        id="scroll-container"
        style={{
          width: "100%",
          height: "400px",
          maxWidth: "600px",
          overflowY: "auto",
          border: "2px solid black",
          padding: "10px",
        }}
      >
        <div style={{ height: "1000px" }}>
          <h2>Scroll down to start scrolling!</h2>
        </div>
      </div>

      <div>
        <p>Intent: {intent}</p>
        <p>Inertia: {inertia}</p>
      </div>
    </div>
  );
};

const TestPage = () => {
  return (
    <div className="p-20" style={{ height: "300px", maxWidth: "1000px" }}>
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
