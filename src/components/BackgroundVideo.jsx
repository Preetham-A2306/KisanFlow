import { useState } from "react";

function BackgroundVideo() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="bg-video-container" aria-hidden="true">
      {!videoError && (
        <video
          className="bg-video-element"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        >
          <source src="/farmer-bg.mp4" type="video/mp4" />
        </video>
      )}
      <div className="bg-video-overlay" />
    </div>
  );
}

export default BackgroundVideo;
