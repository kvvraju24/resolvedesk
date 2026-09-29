import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download, Image as ImageIcon, Sliders, Check } from 'lucide-react';

interface ImageCompressorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCompressedImage?: (dataUrl: string, filename: string, sizeSummary: string) => void;
}

export const ImageCompressorModal: React.FC<ImageCompressorModalProps> = ({
  isOpen,
  onClose,
  onUseCompressedImage,
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('sample-screenshot.png');
  const [originalSize, setOriginalSize] = useState<number>(1850000); // 1.85 MB default
  const [compressedSize, setCompressedSize] = useState<number>(412000); // 412 KB default
  const [quality, setQuality] = useState<number>(75);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOriginalImage(src);
      compressImage(src, quality);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (src: string, targetQuality: number) => {
    setIsCompressing(true);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', targetQuality / 100);
        setCompressedImage(dataUrl);

        // Approximate size
        const head = 'data:image/webp;base64,';
        const rawLength = dataUrl.length - head.length;
        const approxBytes = Math.round((rawLength * 3) / 4);
        setCompressedSize(approxBytes);
      }
      setIsCompressing(false);
    };
  };

  const handleQualityChange = (newVal: number) => {
    setQuality(newVal);
    if (originalImage) {
      compressImage(originalImage, newVal);
    } else {
      // Scale dummy size
      setCompressedSize(Math.round(originalSize * (newVal / 250)));
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = compressedImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKzT3kRhNBzVoJHWxRvjdn9hB4ppF8ABSIlAnJBuYQeHqTvfhXde3MfKa5zJ9BzQTd0l9zhDf8x7h8RHs6lU2iPzSt_GTBtjFPY4k6Ry-LDqO-FhLyeYjlBkQAO0i41DPRUmhBVHSPFY7c4ENXgBbNZ0n64FdXe27Y2AibPpyIN5WPOJwWa1ci_JYknIFWGYOED2Z-_O1vxuAOYNbuPExORUsQ7FN69jDnYcYVFmPdKi5eNfUhdw6fgQ';
    link.download = fileName.replace(/\.[^/.]+$/, '') + '-compressed.webp';
    link.click();
  };

  const handleUseInTicket = () => {
    if (onUseCompressedImage && compressedImage) {
      const summary = `${formatSize(originalSize)} → ${formatSize(compressedSize)} (${Math.round((1 - compressedSize / originalSize) * 100)}% saved)`;
      onUseCompressedImage(compressedImage, fileName, summary);
    }
    onClose();
  };

  const savingsPct = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#ffffff] rounded-2xl shadow-2xl border border-[#c7c4d8]/40 max-w-2xl w-full flex flex-col overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e2dfff] text-[#3525cd]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#0b1c30] text-base">Image Optimizer & Compressor</h3>
              <p className="text-xs text-[#464555]">
                Reduces payload size before ML ingest or customer attachment dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777587] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#c7c4d8] hover:border-[#3525cd] bg-[#eff4ff]/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-[#3525cd] mb-2" />
            <span className="text-sm font-semibold text-[#0b1c30]">
              Click to select or drag and drop image
            </span>
            <span className="text-xs text-[#777587] mt-1">
              Supports PNG, JPG, WebP • Auto-converts to WebP with custom lossy/lossless ratio
            </span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#eff4ff] rounded-xl text-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">Original</span>
              <span className="text-base font-bold text-[#0b1c30] mt-0.5">{formatSize(originalSize)}</span>
            </div>
            <div className="flex flex-col border-x border-[#c7c4d8]/40">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">Compressed</span>
              <span className="text-base font-bold text-[#006e4c] mt-0.5">
                {isCompressing ? '...' : formatSize(compressedSize)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#777587] uppercase tracking-wider">Reduction</span>
              <span className="text-base font-bold text-[#3525cd] mt-0.5">-{savingsPct}%</span>
            </div>
          </div>

          {/* Quality Slider */}
          <div className="flex flex-col gap-2 p-4 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#0b1c30]">
                <Sliders className="w-4 h-4 text-[#3525cd]" />
                WebP Compression Quality
              </span>
              <span className="font-mono px-2 py-0.5 rounded bg-[#3525cd] text-white font-bold">
                {quality}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="w-full h-2 bg-[#dce9ff] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#777587] font-mono">
              <span>20% (Aggressive • Smallest file)</span>
              <span>75% (Balanced)</span>
              <span>95% (Near Lossless)</span>
            </div>
          </div>

          {/* Preview Thumbnail */}
          <div className="flex items-center gap-4 p-3 bg-[#ffffff] rounded-xl border border-[#e5eeff]">
            <div className="w-16 h-16 rounded-lg bg-[#eff4ff] overflow-hidden flex items-center justify-center shrink-0 border border-[#c7c4d8]/40">
              {compressedImage ? (
                <img
                  src={compressedImage}
                  alt="Compressed Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-[#777587]" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-xs text-[#0b1c30] truncate">{fileName}</span>
              <span className="text-[11px] text-[#006e4c] font-medium flex items-center gap-1 mt-0.5">
                <Check className="w-3.5 h-3.5" />
                Optimized format: image/webp
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5eeff] bg-[#eff4ff]/40 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#464555] hover:bg-[#dce9ff] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#ffffff] text-[#0b1c30] border border-[#c7c4d8] hover:bg-[#eff4ff] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-[#3525cd]" />
            Download Compressed
          </button>
          <button
            onClick={handleUseInTicket}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3525cd] text-white hover:bg-[#4f46e5] transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            Attach to Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
