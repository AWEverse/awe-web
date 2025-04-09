import { FC, ReactNode, useEffect, useState } from "react";
import "./ModalLinkPreview.css";

interface OwnProps {
  children?: ReactNode;
  url: string;
  isOpen: boolean;
  onClose: () => void;
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

  useEffect(() => {
    if (!isOpen) return;

    const checkContentTypeAndSafety = async () => {
      try {
        // Basic URL validation
        const urlObj = new URL(url);

        // Determine content type based on extension
        const pathname = urlObj.pathname.toLowerCase();
        if (
          pathname.endsWith(".jpg") ||
          pathname.endsWith(".png") ||
          pathname.endsWith(".gif")
        ) {
          setContentType("image");
          setImageUrl(url);
        } else if (pathname.endsWith(".mp4") || pathname.endsWith(".webm")) {
          setContentType("video");
        } else if (pathname.endsWith(".pdf")) {
          setContentType("pdf");
        } else if (
          urlObj.hostname.includes("youtube.com") ||
          urlObj.hostname.includes("vimeo.com")
        ) {
          setContentType("video");
        } else {
          setContentType("website");
        }

        // Basic safety checks
        const basicSafetyCheck = () => {
          // Check protocol
          if (!url.startsWith("https://")) {
            return false;
          }

          // Check for suspicious patterns
          const suspiciousPatterns = [
            /phishing/,
            /login/,
            /password/,
            /malware/,
          ];
          const isSuspicious = suspiciousPatterns.some((pattern) =>
            pattern.test(url.toLowerCase()),
          );

          return !isSuspicious;
        };

        setIsSafe(basicSafetyCheck());

        // Fetch metadata for websites
        if (contentType === "website") {
          try {
            const response = await fetch(url, {
              method: "HEAD",
              mode: "no-cors", // Note: This limits what we can access
            });
            const contentTypeHeader = response.headers.get("content-type");

            if (contentTypeHeader?.includes("text/html")) {
              // In a real app, you'd use a proxy or server-side service
              // to fetch and parse HTML for metadata
              setDescription("Website content");
            }
          } catch (error) {
            console.error("Error fetching metadata:", error);
          }
        }
      } catch (error) {
        setContentType("invalid");
        setIsSafe(false);
        setDescription("Invalid URL or unable to determine content type");
      }
    };

    checkContentTypeAndSafety();
  }, [isOpen, url, contentType]);

  if (!isOpen) return null;

  const renderContent = () => {
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
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        {renderContent()}
        {children && <div className="modal-children">{children}</div>}
      </div>
    </div>
  );
};

export default ModalLinkPreview;
