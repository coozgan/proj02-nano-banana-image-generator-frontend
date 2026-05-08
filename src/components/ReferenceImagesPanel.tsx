import { useCallback, useRef, useState } from "react";
import {
  ALLOWED_REFERENCE_MIME_TYPES,
  MAX_REFERENCE_FILE_BYTES,
  MAX_REFERENCE_IMAGES,
  type ReferenceImage,
} from "../types";

interface ReferenceImagesPanelProps {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
  disabled?: boolean;
}

export function ReferenceImagesPanel({ images, onChange, disabled }: ReferenceImagesPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_REFERENCE_IMAGES - images.length;
  const nearLimit = images.length >= 10;

  const validateAndAdd = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      const additions: ReferenceImage[] = [];
      let acceptedCount = 0;

      for (const file of incoming) {
        if (images.length + acceptedCount >= MAX_REFERENCE_IMAGES) break;

        let error: string | undefined;
        if (!(ALLOWED_REFERENCE_MIME_TYPES as readonly string[]).includes(file.type)) {
          error = `Unsupported: ${file.type || "unknown"}`;
        } else if (file.size > MAX_REFERENCE_FILE_BYTES) {
          error = `${(file.size / (1024 * 1024)).toFixed(1)} MB · max ${MAX_REFERENCE_FILE_BYTES / (1024 * 1024)} MB`;
        }

        additions.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          error,
        });
        acceptedCount += 1;
      }

      onChange([...images, ...additions]);
    },
    [images, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) validateAndAdd(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((img) => img.id !== id));
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= images.length) return;
    const next = [...images];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="label-caps">References</span>
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-[10px] tracking-wider ${
              images.length === 0
                ? "text-on-variant/50"
                : nearLimit
                ? "text-tertiary"
                : "text-on-variant"
            }`}
          >
            {images.length}/{MAX_REFERENCE_IMAGES}
          </span>
          {images.length > 0 && (
            <button
              onClick={() => {
                for (const img of images) URL.revokeObjectURL(img.previewUrl);
                onChange([]);
              }}
              disabled={disabled}
              className="label-caps hover:text-on-surface transition-colors disabled:opacity-40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && remainingSlots > 0) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && remainingSlots > 0 && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`
          relative cursor-pointer transition-all duration-200 select-none rounded-xl
          border border-dashed
          ${dragOver
            ? "border-primary bg-primary/10 shadow-glow"
            : "border-outline-variant bg-bg-surface/30 hover:border-primary/40 hover:bg-bg-surface/60"}
          ${disabled || remainingSlots === 0 ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_REFERENCE_MIME_TYPES.join(",")}
          onChange={(e) => {
            if (e.target.files?.length) validateAndAdd(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="flex items-center gap-4 px-5 py-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            dragOver ? "bg-primary text-primary-on" : "bg-bg-surface-high text-on-variant"
          }`}>
            <span className="icon text-[20px]">cloud_upload</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-on-surface mb-0.5 leading-tight">
              {remainingSlots === 0
                ? `Maximum ${MAX_REFERENCE_IMAGES} images reached`
                : (
                  <>
                    Drop images or <span className="text-primary">browse files</span>
                  </>
                )}
            </p>
            <p className="text-[11px] text-on-variant/60 font-mono tracking-tight">
              jpeg · png · webp · heic · heif · max {MAX_REFERENCE_FILE_BYTES / (1024 * 1024)} MB each
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
          {images.map((img, i) => (
            <ThumbnailCard
              key={img.id}
              image={img}
              index={i}
              total={images.length}
              onRemove={() => handleRemove(img.id)}
              onMoveLeft={() => handleMove(i, -1)}
              onMoveRight={() => handleMove(i, 1)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-[10px] text-on-variant/55 leading-relaxed">
          Order is preserved in the API request — drag-handle reorder coming later.
        </p>
      )}

      {nearLimit && images.length < MAX_REFERENCE_IMAGES && (
        <p className="text-[10px] text-tertiary/85 flex items-center gap-1.5">
          <span className="icon text-[14px]">warning</span>
          High image count may increase latency
        </p>
      )}
    </div>
  );
}

interface ThumbnailCardProps {
  image: ReferenceImage;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  disabled?: boolean;
}

function ThumbnailCard({ image, index, total, onRemove, onMoveLeft, onMoveRight, disabled }: ThumbnailCardProps) {
  return (
    <div
      className={`group relative rounded-lg overflow-hidden bg-bg-surface-high border anim-fadein ${
        image.error ? "border-error/50" : "border-outline-variant/60"
      }`}
      style={{ aspectRatio: "1/1" }}
    >
      <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover" />

      <span className="absolute top-1.5 left-1.5 font-mono text-[9px] bg-bg-base/85 text-on-surface rounded px-1.5 py-0.5 leading-none backdrop-blur-sm">
        {String(index + 1).padStart(2, "0")}
      </span>

      {image.error && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5">
          <div className="bg-error text-bg-base text-[9px] px-1.5 py-1 rounded leading-tight font-mono">
            {image.error}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-bg-base/0 group-hover:bg-bg-base/70 transition-colors duration-150 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={onMoveLeft}
          disabled={disabled || index === 0}
          title="Move left"
          className="w-7 h-7 rounded glass-overlay text-on-surface hover:border-primary/40 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span className="icon text-[14px]">chevron_left</span>
        </button>
        <button
          onClick={onRemove}
          disabled={disabled}
          title="Remove"
          className="w-7 h-7 rounded bg-error/90 text-bg-base hover:bg-error flex items-center justify-center"
        >
          <span className="icon text-[14px]">close</span>
        </button>
        <button
          onClick={onMoveRight}
          disabled={disabled || index === total - 1}
          title="Move right"
          className="w-7 h-7 rounded glass-overlay text-on-surface hover:border-primary/40 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span className="icon text-[14px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
