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
          error = `Unsupported type: ${file.type || "unknown"}. Use jpeg, png, webp, heic, or heif.`;
        } else if (file.size > MAX_REFERENCE_FILE_BYTES) {
          error = `Too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max is ${
            MAX_REFERENCE_FILE_BYTES / (1024 * 1024)
          } MB per file.`;
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
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            Reference Images
          </span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
              images.length === 0
                ? "text-[var(--text-faint)] border-[var(--border)]"
                : nearLimit
                ? "text-amber-400 border-amber-500/30 bg-amber-500/5"
                : "text-zinc-300 border-[var(--border)] bg-[var(--surface-2)]"
            }`}
          >
            {images.length} / {MAX_REFERENCE_IMAGES}
          </span>
        </div>
        {images.length > 0 && (
          <button
            onClick={() => {
              for (const img of images) URL.revokeObjectURL(img.previewUrl);
              onChange([]);
            }}
            disabled={disabled}
            className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-zinc-100 transition-colors disabled:opacity-40"
          >
            Clear
          </button>
        )}
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
          relative border border-dashed rounded-lg px-4 py-5 text-center cursor-pointer
          transition-all duration-150 select-none
          ${
            dragOver
              ? "border-[var(--banana)] bg-[var(--banana)]/5"
              : "border-[var(--border)] hover:border-zinc-500 hover:bg-[var(--surface-2)]"
          }
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
            e.target.value = ""; // allow re-picking same file
          }}
          className="hidden"
        />

        <svg
          className="w-5 h-5 mx-auto mb-1.5 text-[var(--text-muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 17V3M5 10l7-7 7 7M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <p className="text-xs text-zinc-300 mb-0.5">
          {remainingSlots === 0
            ? `Maximum ${MAX_REFERENCE_IMAGES} images reached`
            : "Drop images or click to browse"}
        </p>
        <p className="text-[10px] text-[var(--text-faint)]">
          jpeg · png · webp · heic · heif · max {MAX_REFERENCE_FILE_BYTES / (1024 * 1024)} MB each
        </p>
      </div>

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
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

      {/* Honest disclosure: order is preserved; effect is undocumented */}
      {images.length > 1 && (
        <p className="mt-2 text-[10px] text-[var(--text-faint)]">
          Order preserved in API request. The Gemini docs don't specify whether image order affects output —
          we send them as you arrange them.
        </p>
      )}

      {nearLimit && images.length < MAX_REFERENCE_IMAGES && (
        <p className="mt-2 text-[10px] text-amber-400/80">
          High image count may increase request size and latency.
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
      className={`group relative rounded-lg overflow-hidden bg-[var(--surface-2)] border ${
        image.error ? "border-red-500/40" : "border-[var(--border)]"
      }`}
      style={{ aspectRatio: "1/1" }}
    >
      <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover" />

      {/* Order badge */}
      <span className="absolute top-1 left-1 font-mono text-[9px] bg-black/70 text-zinc-100 rounded px-1 py-0.5 leading-none">
        {index + 1}
      </span>

      {/* Error indicator */}
      {image.error && (
        <div className="absolute bottom-1 left-1 right-1">
          <div className="bg-red-500/90 text-white text-[9px] px-1.5 py-0.5 rounded leading-tight">
            {image.error}
          </div>
        </div>
      )}

      {/* Hover controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors duration-150 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={onMoveLeft}
          disabled={disabled || index === 0}
          title="Move left"
          className="w-6 h-6 rounded bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
        >
          ←
        </button>
        <button
          onClick={onRemove}
          disabled={disabled}
          title="Remove"
          className="w-6 h-6 rounded bg-red-500/90 text-white hover:bg-red-500 flex items-center justify-center text-[10px]"
        >
          ✕
        </button>
        <button
          onClick={onMoveRight}
          disabled={disabled || index === total - 1}
          title="Move right"
          className="w-6 h-6 rounded bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
        >
          →
        </button>
      </div>
    </div>
  );
}
