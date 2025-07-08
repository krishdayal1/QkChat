import { useState } from "react";
import { X } from "lucide-react";

const ProfileZoomImage = ({ imgUrl }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const openZoom = () => setIsZoomed(true);
  const closeZoom = () => setIsZoomed(false);

  const handleOverlayClick = (e) => {
    if (e.target.id === "zoom-overlay") {
      closeZoom();
    }
  };

  return (
    <>
      <img
        src={imgUrl}
        alt="Profile"
        className="size-32 rounded-full object-cover border-4 cursor-pointer hover:scale-105 transition-all duration-300"
        onClick={openZoom}
      />

      {isZoomed && (
        <div
          id="zoom-overlay"
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <div className="relative scale-100 animate-scaleIn transition-transform duration-300">
            <img
              src={imgUrl}
              alt="Zoomed Profile"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              onClick={closeZoom}
              className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileZoomImage;
