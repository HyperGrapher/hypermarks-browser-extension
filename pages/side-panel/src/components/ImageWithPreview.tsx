import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ImageWithPreview = ({ src }: { src: string }) => {
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeout = useRef<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = (event: React.MouseEvent) => {
    const { top, left, height } = event.currentTarget.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    // Check if the image is near the bottom of the screen
    const isNearBottom = screenHeight - top - height < 150; // 150px as a buffer

    // Set position, and determine if the preview should go upwards or downwards
    setPreviewPosition({
      top: isNearBottom ? top - 150 : top + height, // If near the bottom, show the preview upwards
      left,
    });

    hoverTimeout.current = window.setTimeout(() => setShowPreview(true), 1000); // 1 second delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowPreview(false);
    setPreviewPosition(null);
  };

  return (
    <>
      <div className="w-full relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Main Image */}
        <img
          className="clickable size-12 w-full object-cover object-top rounded-lg border border-gray-300/20"
          src={src}
          alt=""
          decoding="async"
        />
        {/* Image overlay - HIDDEN */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 via-transparent to-transparent rounded-lg pointer-events-none hidden"></div>
      </div>

      {/* Render Preview via Portal */}
      {showPreview &&
        previewPosition &&
        createPortal(
          <div
            className="fixed z-50 flex items-center justify-center bg-black/80 border border-gray-200 rounded-lg overflow-hidden"
            style={{
              top: previewPosition.top,
              left: previewPosition.left - 14,
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: 'calc(100vh - 20px)',
              width: 'auto',
              height: 'auto',
            }}>
            <img
              className="rounded-lg object-contain"
              src={src}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          </div>,
          document.body, // Render outside the relative parent
        )}
    </>
  );
};

export default ImageWithPreview;
