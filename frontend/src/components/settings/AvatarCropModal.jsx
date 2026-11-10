import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Loader2, Move } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CROP_VIEWPORT = 256;
const OUTPUT_SIZE = 512;

export function AvatarCropModal({
  isOpen,
  imageSrc,
  fileName,
  fileSize,
  onClose,
  onConfirm,
  isUploading = false,
  error = null,
}) {
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const imgRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setNaturalSize({ width: 0, height: 0 });
    }
  }, [isOpen, imageSrc]);

  const baseScale =
    naturalSize.width > 0 && naturalSize.height > 0
      ? Math.max(CROP_VIEWPORT / naturalSize.width, CROP_VIEWPORT / naturalSize.height)
      : 1;

  const effectiveScale = baseScale * zoom;

  const clampOffset = useCallback(
    (nextX, nextY, scale) => {
      if (!naturalSize.width || !naturalSize.height) return { x: 0, y: 0 };
      const dispW = naturalSize.width * scale;
      const dispH = naturalSize.height * scale;
      const maxX = Math.max(0, (dispW - CROP_VIEWPORT) / 2);
      const maxY = Math.max(0, (dispH - CROP_VIEWPORT) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, nextX)),
        y: Math.min(maxY, Math.max(-maxY, nextY)),
      };
    },
    [naturalSize]
  );

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, effectiveScale));
  }, [zoom, effectiveScale, clampOffset]);

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    setNaturalSize({
      width: img.naturalWidth || CROP_VIEWPORT,
      height: img.naturalHeight || CROP_VIEWPORT,
    });
  };

  const handlePointerDown = (e) => {
    if (isUploading) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset(
      clampOffset(
        dragStartRef.current.origX + dx,
        dragStartRef.current.origY + dy,
        effectiveScale
      )
    );
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setIsDragging(false);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleSaveCrop = () => {
    const img = imgRef.current;
    if (!img || !naturalSize.width || !naturalSize.height) return;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = OUTPUT_SIZE / CROP_VIEWPORT;
    const drawW = naturalSize.width * effectiveScale * ratio;
    const drawH = naturalSize.height * effectiveScale * ratio;
    const drawX = (OUTPUT_SIZE - drawW) / 2 + offset.x * ratio;
    const drawY = (OUTPUT_SIZE - drawH) / 2 + offset.y * ratio;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onConfirm(blob, 'avatar.webp');
        } else {
          canvas.toBlob(
            (pngBlob) => {
              if (pngBlob) onConfirm(pngBlob, 'avatar.png');
            },
            'image/png'
          );
        }
      },
      'image/webp',
      0.92
    );
  };

  if (!isOpen || !imageSrc) return null;

  const formattedSize =
    fileSize >= 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(fileSize / 1024))} KB`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
          <div>
            <h3
              id="avatar-crop-title"
              className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]"
            >
              Adjust Profile Picture
            </h3>
            <p className="text-[11px] text-[#64748B] truncate max-w-[260px]">
              {fileName || 'Selected image'} • {formattedSize}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#21262D] transition cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Crop Stage */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative rounded-full overflow-hidden border-2 border-[#F59E0B] bg-[#0F172A]/90 shadow-inner touch-none select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ width: CROP_VIEWPORT, height: CROP_VIEWPORT }}
            >
              {naturalSize.width === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute top-1/2 left-1/2 max-w-none pointer-events-none select-none"
                style={{
                  width: naturalSize.width ? `${naturalSize.width * effectiveScale}px` : 'auto',
                  height: naturalSize.height ? `${naturalSize.height * effectiveScale}px` : 'auto',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />

              {/* Subtle rule-of-thirds circular ring guide */}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#64748B]">
              <Move className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Drag image to reposition inside circle</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">Zoom</span>
              <span className="font-mono text-[11px] text-[#64748B]">{zoom.toFixed(2)}x</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                disabled={zoom <= 1 || isUploading}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white dark:hover:bg-[#21262D] disabled:opacity-40 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                disabled={isUploading}
                className="flex-1 accent-[#F59E0B] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                disabled={zoom >= 3 || isUploading}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white dark:hover:bg-[#21262D] disabled:opacity-40 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                title="Reset crop"
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F59E0B] hover:bg-white dark:hover:bg-[#21262D] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-xs text-[#DC2626] font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0D1117] border-t border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isUploading}
            onClick={handleSaveCrop}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Save Profile Picture
          </Button>
        </div>
      </div>
    </div>
  );
}

