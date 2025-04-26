import { FC, ReactNode, useState, useRef, ChangeEvent, DragEvent } from "react";
import s from "./ModalEditAvatar.module.scss";
import { CameraAltOutlined } from "@mui/icons-material";

type Props = Readonly<{
  children?: ReactNode;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  userAvatarUrl?: string;
}>;

const ModalEditAvatar: FC<Props> = ({
  userAvatarUrl = "",
  onClose,
  onSave,
  children,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(userAvatarUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Select an image file";
    if (file.size > 5 * 1024 * 1024) return "File size must be < 5MB";
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setError(error);
      return;
    }
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInputRef.current!.files = dataTransfer.files;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSave = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      await onSave(file);
      onClose();
    } catch {
      setError("Failed to save avatar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`${s.modal} ${isDragging ? s.dragging : ""}`}
      role="dialog"
      aria-labelledby="modal-title"
      onDrop={handleDrop}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      <div className={s.modalContent}>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <div className={s.avatarContainer}>
          <div className={s.avatarWrapper}>
            <img
              src={previewUrl || "https://i.pravatar.cc/300"}
              alt="Avatar Preview"
              className={s.avatar}
              onError={({ currentTarget }) => {
                currentTarget.src = "https://i.pravatar.cc/300";
              }}
            />
            <label htmlFor="avatar-upload" className={s.cameraIcon}>
              <CameraAltOutlined />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className={s.fileInput}
              onChange={handleFileChange}
              ref={fileInputRef}
              aria-label="Upload avatar"
            />
          </div>
        </div>
        <div className={s.buttonContainer}>
          <button
            className={s.cancelButton}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            className={s.saveButton}
            onClick={handleSave}
            disabled={isLoading || !fileInputRef.current?.files?.[0]}
            aria-label="Save avatar"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalEditAvatar;
