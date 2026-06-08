/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Avatar } from './Avatar';
import { 
  Upload, 
  Camera, 
  Trash2, 
  X, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertCircle, 
  Move,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AvatarUploadZone: React.FC = () => {
  const { user, updateUser } = useFlowStore();
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cropper specific state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Uploading / saving simulation
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageType, setStorageType] = useState<'local' | 'cloud'>('local');

  // Input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const containerSize = 300; // cropping viewport boundary size

  // Reset states
  const handleCancelCrop = () => {
    setSelectedImage(null);
    setFileName('');
    setFileSize('');
    setDimensions({ width: 0, height: 0 });
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setError(null);
  };

  // Validate and read file
  const handleFileProcess = (file: File) => {
    setError(null);
    
    // supported file formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported format. Please select a JPG, JPEG, PNG, or WEBP image file.');
      return;
    }

    // max file size (5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Sizing exceeded: ${(file.size / 1024 / 1024).toFixed(2)}MB is above the 5MB file threshold.`);
      return;
    }

    // Determine storage type target context based on production window URL
    const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    setStorageType(isProduction ? 'cloud' : 'local');

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setShowOptions(false);
    };
    reader.onerror = () => {
      setError('Could not process the selected image file.');
    };
    reader.readAsDataURL(file);
  };

  // Listeners for triggers
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handlePickCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    // Instant optimistic removal updating
    updateUser({ avatar: undefined });
    setShowOptions(false);
    setError(null);
  };

  // Desktop Drag & Drop logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Get image dimensions on load
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Drag pan gesture state variables
  const isDraggingImg = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingImg.current = true;
    startDragPos.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingImg.current) return;
    setPan({
      x: e.clientX - startDragPos.current.x,
      y: e.clientY - startDragPos.current.y
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingImg.current = false;
  }, []);

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingImg.current = true;
      startDragPos.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingImg.current) return;
    if (e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - startDragPos.current.x,
        y: e.touches[0].clientY - startDragPos.current.y
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingImg.current = false;
  }, []);

  // Bind mouse and touch events globally on document when dragging is active
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Keyboard accessibility: Pan with arrows, zoom with + / -
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      const step = 8; // pixel shift step
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPan(p => ({ ...p, y: p.y - step }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPan(p => ({ ...p, y: p.y + step }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPan(p => ({ ...p, x: p.x - step }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPan(p => ({ ...p, x: p.x + step }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(z => Math.min(3.5, z + 0.1));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setZoom(z => Math.max(1, z - 0.1));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          setZoom(1);
          setPan({ x: 0, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Centering / Resetting
  const handleResetAlignment = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Crop & Save process (Supports optimistic updates and realistic upload indicator)
  const handleSaveCrop = () => {
    if (!imgRef.current) return;
    setIsSaving(true);
    setUploadProgress(10);

    // Progressive simulated uploads tracker
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const cropSize = 400; // Output high-quality 400x400 square image
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext('2d');

        if (ctx && dimensions.width && dimensions.height) {
          const imgW = dimensions.width;
          const imgH = dimensions.height;
          const fitScale = Math.max(containerSize / imgW, containerSize / imgH);
          const S = fitScale * zoom;

          // Align initial positions based on container centering
          const X_init = (containerSize - imgW * S) / 2;
          const Y_init = (containerSize - imgH * S) / 2;

          const X_current = X_init + pan.x;
          const Y_current = Y_init + pan.y;

          // Trace viewport coordinate bounds back to source raw coordinates
          const sx = (0 - X_current) / S;
          const sy = (0 - Y_current) / S;
          const sw = containerSize / S;
          const sh = containerSize / S;

          ctx.drawImage(
            imgRef.current,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            cropSize,
            cropSize
          );

          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          
          setUploadProgress(100);
          
          // Optimistic state sync
          updateUser({ avatar: croppedDataUrl });
          
          setTimeout(() => {
            clearInterval(interval);
            setIsSaving(false);
            setSelectedImage(null);
            handleCancelCrop();
          }, 200);
        }
      } catch (err) {
        clearInterval(interval);
        setIsSaving(false);
        setError('Failed during canvas matrix rendering. Please load a clean, local photo.');
        console.error(err);
      }
    }, 1400);
  };

  // Fit calculations for the viewport element styling
  const fitScale = dimensions.width && dimensions.height 
    ? Math.max(containerSize / dimensions.width, containerSize / dimensions.height) 
    : 1;
  const imageWidth = dimensions.width * fitScale;
  const imageHeight = dimensions.height * fitScale;

  const X_init = (containerSize - imageWidth * zoom) / 2;
  const Y_init = (containerSize - imageHeight * zoom) / 2;
  const currentX = X_init + pan.x;
  const currentY = Y_init + pan.y;

  return (
    <div className="space-y-4">
      
      {/* Hidden system files triggers */}
      <input
        ref={fileInputRef}
        type="file"
        id="avatar-upload-file-input"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={onFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        id="avatar-camera-file-input"
        accept="image/*"
        capture="user"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        
        {/* ACTIVE AVATAR WRAPPER WITH ACTION MENU CAPABILITIES */}
        <div className="relative shrink-0 self-center sm:self-start">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="group relative cursor-pointer outline-none rounded-full transition-transform ring-offset-2 hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-neutral-900 border border-neutral-300 dark:border-neutral-800"
            title="Edit workspace user snapshot"
            id="avatar-trigger-button"
          >
            {/* Direct Avatar Component */}
            <Avatar name={user?.name || ''} avatar={user?.avatar} size="xl" />
            
            {/* Floating edit pencil pill helper */}
            <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-md ring-2 ring-white dark:ring-neutral-950 transition-colors group-hover:scale-110">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </button>

          {/* QUICK CHOOSE OVERLAY OPTIONS */}
          {showOptions && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowOptions(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-3 z-30 w-48 rounded-xl border border-neutral-150 bg-white p-1.5 shadow-xl dark:border-neutral-850 dark:bg-neutral-950"
              >
                <button
                  type="button"
                  onClick={() => {
                    handlePickFile();
                    setShowOptions(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePickCamera();
                    setShowOptions(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:hidden"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Take Selfie Photo</span>
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
                <div className="my-1 border-t border-neutral-100 dark:border-neutral-900" />
                <button
                  type="button"
                  onClick={() => setShowOptions(false)}
                  className="flex w-full items-center justify-center rounded-lg py-1.5 text-center text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  Cancel
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* GENERAL DESCRIPTION DESKTOP DRAG ZONE */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 rounded-2xl border-2 border-dashed p-5 transition-all text-center sm:text-left flex flex-col justify-center ${
            isDragging 
              ? 'border-neutral-950 bg-neutral-50 dark:border-white dark:bg-neutral-900/40 scale-[1.01]' 
              : 'border-neutral-200 hover:border-neutral-350 dark:border-neutral-850 dark:hover:border-neutral-850'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-full text-neutral-500 dark:text-neutral-450 shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-150 uppercase tracking-wider">
                Upload custom profile image
              </h4>
              <p className="text-[10px] text-neutral-450 leading-relaxed font-semibold">
                Drag & drop or Click to choose. Supports <strong className="text-neutral-600 dark:text-neutral-300">PNG, WEBP, or JPG</strong> up to <strong className="text-neutral-600 dark:text-neutral-300">5 MB</strong>.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={handlePickFile}
              className="rounded-xl border border-neutral-250 bg-white px-3.5 py-1.5 text-[11px] font-black text-neutral-950 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 transition-colors pointer-events-auto"
            >
              Choose local file
            </button>
            <button
              type="button"
              onClick={handlePickCamera}
              className="rounded-xl border border-neutral-250 bg-white px-3.5 py-1.5 text-[11px] font-black text-neutral-950 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 transition-colors inline-flex items-center gap-1"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Use Camera</span>
            </button>
          </div>
        </div>

      </div>

      {/* ERROR FEEDBACK BAR */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 text-rose-700 p-3 text-xs font-semibold dark:bg-rose-950/20 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
          <button 
            type="button" 
            onClick={() => setError(null)} 
            className="ml-auto text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* CROPPING EDITOR VIEWPORT MODAL OVERLAY */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-white shadow-2xl relative"
            >
              {/* Modal header details */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-100">
                    Circular Image Cropper
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed truncate max-w-[280px]">
                    {fileName} ({fileSize})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
                  aria-label="Cancel crop edits"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* EDITOR STAGE CORE CONTAINER */}
              <div className="flex flex-col items-center">
                
                {/* 300x300 Canvas/Image viewports */}
                <div 
                  ref={containerRef}
                  className="relative h-[300px] w-[300px] overflow-hidden rounded-lg bg-neutral-900 shadow-inner border border-neutral-800 relative cursor-move"
                  style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
                >
                  {/* Raw loading image with panning offsets styled */}
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Loaded matrix"
                    onLoad={handleImageLoaded}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className="absolute max-w-none select-none origin-top-left"
                    style={{
                      width: `${imageWidth / zoom}px`,
                      height: `${imageHeight / zoom}px`,
                      transform: `translate(${currentX}px, ${currentY}px) scale(${zoom})`,
                      cursor: isDraggingImg.current ? 'grabbing' : 'grab',
                    }}
                    referrerPolicy="no-referrer"
                  />

                  {/* Circular Crop boundary Mask Aperture layer */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Dark translucent boundaries outside avatar circle */}
                    <svg className="w-full h-full absolute inset-0">
                      <defs>
                        <mask id="circular-aperture-mask">
                          <rect width="100%" height="100%" fill="white" />
                          <circle cx="50%" cy="50%" r="148" fill="black" />
                        </mask>
                      </defs>
                      <rect width="100%" height="100%" fill="black" fillOpacity="0.65" mask="url(#circular-aperture-mask)" />
                      {/* Crisp thin circle accent indicator */}
                      <circle cx="50%" cy="50%" r="149" fill="none" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.8" strokeDasharray="3 3" />
                      <circle cx="50%" cy="50%" r="148" fill="none" stroke="#000" strokeWidth="0.5" strokeOpacity="0.2" />
                    </svg>
                  </div>

                  {/* Tiny positioning focus visual anchors */}
                  <div className="absolute pointer-events-none inset-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/70 shadow-sm" />
                  </div>

                  {/* Direct visual pan indicator */}
                  <div className="absolute bottom-2.5 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider text-neutral-300 pointer-events-none flex items-center gap-1">
                    <Move className="h-2.5 w-2.5" />
                    <span>DRAG TO PAN</span>
                  </div>
                </div>

                {/* Sourcing scale pixel metrics indicator */}
                <div className="mt-3 text-center">
                  <p className="text-[9.5px] font-mono text-neutral-400 font-bold tracking-wide">
                    FRAME SELECTION: 400 × 400px (Source: {dimensions.width || '?'} × {dimensions.height || '?'}px)
                  </p>
                </div>

                {/* ZOOM SLIDER CONTROL RANGE WITH DUAL TRIGGER BUTTONS */}
                <div className="w-full mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-neutral-400">
                    <span>Resize scale factor</span>
                    <span className="font-mono">{zoom.toFixed(1)}x</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setZoom(z => Math.max(1, z - 0.15))}
                      className="rounded-lg p-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white transition-colors"
                      title="Zoom out factor (- key)"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    
                    <input
                      type="range"
                      min={1}
                      max={3.5}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-white h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setZoom(z => Math.min(3.5, z + 0.15))}
                      className="rounded-lg p-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white transition-colors"
                      title="Zoom in factor (+ key)"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* CONTROL TOOLS BOX BAR */}
                <div className="flex w-full items-center justify-between gap-4 mt-4 pt-4 border-t border-neutral-900 text-[10px] text-neutral-400 font-bold">
                  {/* Keyboard suggestions */}
                  <span className="hidden sm:inline-block font-mono tracking-wide text-neutral-500">
                    ⌨ Arrows to Pan • + / - to Zoom
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleResetAlignment}
                    className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-2.5 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors text-[10px] uppercase tracking-wider font-extrabold select-none"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Recenter</span>
                  </button>
                </div>

                {/* SIMULATED DATABASE TARGET STORAGE SUMMARY */}
                <div className="w-full mt-4 rounded-xl bg-neutral-900/50 border border-neutral-900 p-2.5 text-[9px] text-neutral-450 leading-relaxed font-semibold">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-bold mb-0.5 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Storage Manifest Vault</span>
                  </div>
                  {storageType === 'local' ? (
                    <p>Local development active. Cropped profile avatar will compile and persist to local workspace uploads folder, with an optimistic state cache.</p>
                  ) : (
                    <p>Production active. Image uploads optimized client-side (Base64 URL) and safely persisted into cloud localStorage database caches.</p>
                  )}
                </div>

              </div>

              {/* SAVE / EXITS CONTROLS SUBMITS SCREEN */}
              <div className="mt-5 pt-3.5 border-t border-neutral-900 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancelCrop}
                  className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white dark:hover:bg-neutral-900 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCrop}
                  className="rounded-xl bg-white px-5 py-2 text-xs font-black uppercase tracking-wider text-neutral-950 hover:bg-neutral-100 transition-all shadow-md disabled:bg-neutral-800 disabled:text-neutral-500 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Optimizing {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
