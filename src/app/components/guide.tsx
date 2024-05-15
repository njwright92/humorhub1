import { useState } from "react";
import Image from "next/image";

const Guide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVideo = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="guide-container">
      <button className="gif-button" onClick={toggleVideo}>
        {/* Replace 'path_to_gif.gif' with your actual gif path */}
        <img
          src="path_to_gif.gif"
          alt="Open Guide"
          height={20}
          width={20}
          className="shadown-xl rounded-full"
        />
      </button>

      {isOpen && (
        <div className="video-modal">
          <video width="100%" height="100%" controls>
            <source src="path_to_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={toggleVideo}
            className="ml-4 text-red-500 bg-zinc-900 rounded-lg drop-shadow-lg border-none p-2"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Guide;
