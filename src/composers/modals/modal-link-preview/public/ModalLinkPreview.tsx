import { FC, ReactNode, useEffect, useState } from "react";

interface OwnProps {
  children?: ReactNode;
  url?: string;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  imageUrl?: string;
}

interface StateProps {}

type Props = OwnProps & StateProps;

const ModalLinkPreview: FC<Props> = ({
  children,
  url,
  isOpen,
  onClose,
  title: initialTitle,
  description: initialDescription,
  imageUrl: initialImageUrl,
}) => {
  const [contentType, setContentType] = useState<string>("loading");
  const [isSafe, setIsSafe] = useState<boolean | null>(null);
  const [title, setTitle] = useState(initialTitle || "Link Preview");
  const [description, setDescription] = useState(
    initialDescription || "Click to visit",
  );
  const [imageUrl, setImageUrl] = useState(
    initialImageUrl || "https://via.placeholder.com/150",
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        {(() => {
          if (contentType === "loading") {
            return <p>Loading preview...</p>;
          }

          if (contentType === "invalid" || isSafe === false) {
            return (
              <div className="warning">
                <h2>Warning</h2>
                <p>
                  {isSafe === false
                    ? "This link may not be safe to visit."
                    : "Unable to preview this link."}
                </p>
              </div>
            );
          }

          return (
            <div className="link-preview-container">
              {contentType === "image" && (
                <div className="preview-image">
                  <img src={imageUrl} alt="Preview" />
                </div>
              )}
              {contentType === "video" && (
                <div className="preview-video">
                  <p>Video content preview not available</p>
                  <p>Click to visit the video</p>
                </div>
              )}
              {contentType === "pdf" && (
                <div className="preview-pdf">
                  <p>PDF Document</p>
                </div>
              )}

              <div className="preview-details">
                <h2 className="preview-title">{title}</h2>
                <p className="preview-description">{description}</p>
                <p className="content-type">Type: {contentType}</p>
                {isSafe && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-link"
                  >
                    {contentType === "website"
                      ? "Visit Website"
                      : contentType === "image"
                        ? "View Image"
                        : contentType === "video"
                          ? "Watch Video"
                          : "Open Content"}
                  </a>
                )}
              </div>
            </div>
          );
        })()}
        {children && <div className="modal-children">{children}</div>}
      </div>
    </div>
  );
};

export default ModalLinkPreview;
