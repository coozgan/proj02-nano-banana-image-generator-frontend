import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { Lightbox } from "./Lightbox";
import type { GalleryItem } from "../types";

interface ResultGalleryProps {
  items: GalleryItem[];
  pendingCount?: number;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onClearAll?: () => void;
  onPromptSelect?: (prompt: string) => void;
  onDelete?: (id: string) => void;
}

export function ResultGallery({
  items,
  pendingCount = 0,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onClearAll,
  onPromptSelect,
  onDelete,
}: ResultGalleryProps) {
  const hasItems = items.length > 0 || pendingCount > 0;

  if (!hasItems) {
    return <EmptyState onPromptSelect={onPromptSelect} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="label-caps">Gallery</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-on-variant/70">
            {items.length} {items.length === 1 ? "image" : "images"}
          </span>
          {items.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="label-caps hover:text-error transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div
        className="grid gap-3 sm:gap-4
                   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                   md:auto-rows-[260px]"
      >
        {/* Pending tiles */}
        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="aspect-square md:aspect-auto rounded-xl glass-overlay flex items-center justify-center"
          >
            <PulseDots />
          </div>
        ))}
        {/* Real images */}
        {items.map((item, idx) => (
          <ImageCard key={item.id} item={item} index={idx} onDelete={onDelete} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                       glass-overlay text-on-surface
                       hover:border-primary/40 hover:bg-bg-surface-high/70
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loadingMore ? (
              <PulseDots />
            ) : (
              <>
                <span className="icon text-[16px] text-primary group-hover:scale-110 transition-transform">expand_more</span>
                <span className="text-sm font-medium">Load more</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function PulseDots() {
  return (
    <div className="flex items-center gap-1.5" aria-label="Loading">
      <span className="w-1.5 h-1.5 rounded-full bg-primary anim-pulse-dot" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary anim-pulse-dot" style={{ animationDelay: "0.2s" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-primary anim-pulse-dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

function bentoSpan(index: number): string {
  // Featured tile every 7 items: spans 2 cols + 2 rows from md+
  if (index % 7 === 0) return "md:col-span-2 md:row-span-2";
  return "";
}

function ImageCard({
  item,
  index,
  onDelete,
}: {
  item: GalleryItem;
  index: number;
  onDelete?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const src = `data:${item.image.mime_type};base64,${item.image.data_base64}`;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ext = item.image.mime_type.split("/")[1] ?? "png";
    const a = document.createElement("a");
    a.href = src;
    a.download = `nano-banana-${item.id.slice(0, 8)}.${ext}`;
    a.click();
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(item.id);
  };

  return (
    <div className={`anim-fadein ${bentoSpan(index)}`}>
      <div
        className="group relative h-full w-full cursor-pointer overflow-hidden rounded-xl
                   glass-overlay aspect-square md:aspect-auto
                   hover:border-primary/40 transition-colors"
        onClick={() => setExpanded(true)}
      >
        <img
          src={src}
          alt={item.prompt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {item.image.text && (
            <span className="px-1.5 py-0.5 rounded label-caps bg-bg-base/65 backdrop-blur-sm border border-white/10 text-secondary">
              CAPTION
            </span>
          )}
        </div>

        {/* Hover gradient + prompt */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-base/95 via-bg-base/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-on-surface line-clamp-2 leading-snug font-display">
            {item.prompt}
          </p>
          <p className="font-mono text-[9px] text-on-variant/70 mt-1 tracking-wider">
            {item.timestamp.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Hover action chips */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ActionChip
            label={copied ? "Copied" : "Copy prompt"}
            iconName={copied ? "check" : "content_copy"}
            onClick={handleCopyPrompt}
            highlight={copied}
          />
          <ActionChip label="Download" iconName="download" onClick={handleDownload} />
          {onDelete && (
            <ActionChip label="Delete" iconName="delete" onClick={handleDelete} variant="danger" />
          )}
        </div>
      </div>

      {expanded && (
        <Lightbox src={src} alt={item.prompt} prompt={item.prompt} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}

function ActionChip({
  label,
  iconName,
  onClick,
  highlight,
  variant,
}: {
  label: string;
  iconName: string;
  onClick: (e: React.MouseEvent) => void;
  highlight?: boolean;
  variant?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all
        ${highlight
          ? "bg-success/90 text-bg-base border-success"
          : variant === "danger"
          ? "bg-bg-base/70 text-on-surface border-white/10 hover:bg-error/85 hover:text-bg-base hover:border-error"
          : "bg-bg-base/70 text-on-surface border-white/10 hover:bg-primary/85 hover:text-primary-on hover:border-primary"}`}
    >
      <span className="icon text-[16px]">{iconName}</span>
    </button>
  );
}
