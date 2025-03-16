import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define types for gallery items
export type GalleryItem = {
  id: string;
  color: string;
  title?: string;
  description?: string;
};

type GalleryProps = {
  items: GalleryItem[];
  initialSelectedId?: string | null;
  gridConfig?: {
    columns?: string;
    gap?: string;
    itemSize?: string;
  };
};

export function ResponsiveGallery({
  items,
  initialSelectedId = null,
  gridConfig = {
    columns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "12px",
    itemSize: "100%",
  },
}: GalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );

  // Memoize selectedItem to avoid recalculating on every render
  const selectedItem = useMemo(
    () => (selectedId ? items.find((item) => item.id === selectedId) : null),
    [selectedId, items],
  );

  // Handler to close the modal
  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  // Add keydown listener only when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedId !== null) {
        handleClose();
      }
    };

    if (selectedId !== null) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedId, handleClose]);

  return (
    <div className="gallery-wrapper">
      {/* Grid of items */}
      <motion.ul
        className="gallery-grid"
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: gridConfig.columns,
          gap: gridConfig.gap,
        }}
      >
        {items.map((item) => (
          <motion.li
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            style={{
              cursor: "pointer",
              aspectRatio: "1",
              borderRadius: "8px",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              layoutId={`item-${item.id}`}
              style={{
                backgroundColor: item.color,
                width: gridConfig.itemSize,
                height: "100%",
                borderRadius: "8px",
              }}
            />
          </motion.li>
        ))}
      </motion.ul>

      {/* Modal overlay and enlarged item */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="gallery-overlay"
              onClick={handleClose}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "black",
                zIndex: 100,
              }}
            />

            {/* Enlarged item container */}
            <div
              className="gallery-modal-container"
              onClick={handleClose}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 101,
                padding: "5vw",
              }}
            >
              <motion.div
                key="modal"
                layoutId={`item-${selectedItem.id}`}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="gallery-modal"
                style={{
                  backgroundColor: selectedItem.color,
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  width: selectedItem.title
                    ? "min(500px, 90vw)"
                    : "min(300px, 80vw)",
                  aspectRatio: selectedItem.title ? "auto" : "1",
                  borderRadius: "16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                  position: "relative",
                }}
              >
                {selectedItem.title && (
                  <div
                    className="modal-content"
                    style={{
                      padding: "clamp(16px, 5vw, 24px)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h2 style={{ margin: 0 }}>{selectedItem.title}</h2>
                      <button
                        onClick={handleClose}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "24px",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "40px",
                          height: "40px",
                        }}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                    {selectedItem.description && (
                      <p>{selectedItem.description}</p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Example component with color items
const TestPage: React.FC = () => {
  const numColors = 12;
  const colorItems: GalleryItem[] = Array.from({ length: numColors }).map(
    (_, i) => {
      const hue = Math.round((360 / numColors) * i);
      return {
        id: `color-${i}`,
        color: `hsl(${hue}, 100%, 50%)`,
        title: i % 3 === 0 ? `Color ${i + 1}` : undefined,
        description:
          i % 3 === 0 ? `This is a color with hue value of ${hue}` : undefined,
      };
    },
  );

  return <ResponsiveGallery items={colorItems} />;
};

export default TestPage;
