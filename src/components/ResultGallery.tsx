import { useState } from "react";
import { Button } from "./ui/Button";
import { EmptyState } from "./EmptyState";
import type { GalleryItem } from "../types";

interface ResultGalleryProps {
  items: GalleryItem[];
  pendingCount?: number;
  onClearAll?: () => void;
}

export function ResultGallery({ items, pendingCount = 0, onClearAll }: ResultGalleryProps) {
  const hasItems = items.length > 0 || pendingCount > 0;

  return (
    <div>
      {!hasItems ? (
        <EmptyState />
      ) : (
        <>
          {items.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {items.length} image{items.length !== 1 ? "s" : ""} this session
              </span>
              <Button variant="ghost" size="sm" onClick={onClearAll} className="text-[10px]">
                Clear all
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Skeleton placeholders for pending */}
            {Array.from({ length: pendingCount }).map((_, i) => (
              <div key={`skeleton-${i}`} className="aspect-square rounded-xl overflow-hidden animate-skeleton" />
            ))}
            {/* Real images — newest first */}
            {[...items].reverse().map((item) => (
              <ImageCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ImageCard({ item }: { item: GalleryItem }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const src = `data:${item.image.mime_type};base64,${item.image.data_base64}`;

  const handleDownload = () => {
    const ext = item.image.mime_type.split("/")[1] ?? "png";
    const a = document.createElement("a");
    a.href = src;
    a.download = `nano-banana-${item.id.slice(0, 8)}.${ext}`;
    a.click();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative animate-fadein card overflow-hidden hover:border-zinc-600 transition-colors">
      <div
        className="relative cursor-pointer overflow-hidden bg-[var(--surface-2)]"
        onClick={() => setExpanded(true)}
        style={{ aspectRatio: "1/1" }}
      >
        <img
          src={src}
          alt={item.prompt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end">
          <div className="p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 w-full">
            <p className="text-xs text-zinc-200 line-clamp-2 leading-snug">{item.prompt}</p>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[var(--surface-2)] border-t border-[var(--border)]">
        <span className="font-mono text-[9px] text-[var(--text-faint)] flex-1 truncate">
          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <button
          onClick={handleCopyPrompt}
          title="Copy prompt"
          className="p-1 text-[var(--text-muted)] hover:text-zinc-100 transition-colors rounded"
        >
          {copied ? (
            <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="5" width="9" height="9" rx="1.5"/>
              <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5"/>
            </svg>
          )}
        </button>
        <button
          onClick={handleDownload}
          title="Download"
          className="p-1 text-[var(--text-muted)] hover:text-zinc-100 transition-colors rounded"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Caption if present */}
      {item.image.text && (
        <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--surface-0)]">
          <p className="text-xs text-zinc-400 leading-relaxed">{item.image.text}</p>
        </div>
      )}

      {/* Lightbox */}
      {expanded && (
        <Lightbox src={src} alt={item.prompt} onClose={() => setExpanded(false)} />
      )}
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 animate-fadein"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800 border border-[var(--border)] text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
