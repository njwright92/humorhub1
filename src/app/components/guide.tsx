import { useState } from "react";
import Image from "next/image";
import playVideo from "../../app/playVideo.webp";

const Guide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const toggleVideo = () => {
    setIsOpen(!isOpen);
  };

  const hideButton = () => {
    setIsButtonVisible(false);
  };

  return (
    <div className="guide-container">
      {isButtonVisible && (
        <div className="relative inline-block">
          <button className="gif-button" onClick={toggleVideo}>
            <Image
              src={playVideo}
              alt="Open Guide"
              height={70}
              width={70}
              className="shadow-xl rounded-full"
            />
          </button>
          <button
            onClick={hideButton}
            className="absolute text-zinc-100 font-semibold"
            style={{ top: "-0.5rem", right: "-0.5rem", background: "none" }}
          >
            X
          </button>
        </div>
      )}

      {isOpen && (
        <div className="video-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative w-full h-full sm:w-full sm:h-full md:w-auto md:h-auto">
            <button
              onClick={toggleVideo}
              className="ml-4 text-zinc-100 bg-orange-500 rounded-lg drop-shadow-lg border-none p-2 text-xl font-semibold"
            >
              X
            </button>
            <video
              className="w-full h-full xs:w-full xs:h-full md:w-82 md:h-138"
              controls
            >
              <source src="path_to_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guide;
