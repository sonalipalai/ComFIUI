import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  label: string;
  image: string | null;
  onChange: (base64: string | null) => void;
  className?: string;
}

export function ImageUpload({ label, image, onChange, className }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">{label}</label>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full"
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer",
            isDragActive ? "border-blue-500/50 bg-blue-500/5 glow-sm" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60",
            image ? "border-solid border-zinc-800" : ""
          )}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
          {image ? (
            <motion.div 
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              <img src={image} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-white/10 border border-white/20">
                    <ImageIcon className="text-white" size={20} />
                  </div>
                  <p className="text-white text-xs font-semibold tracking-wide">CLICK TO REPLACE</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-zinc-400 hover:text-white border border-white/10 backdrop-blur-md transition-all"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <div className={cn(
                "p-4 rounded-2xl transition-all duration-300",
                isDragActive ? "bg-blue-500 text-white shadow-lg" : "bg-zinc-800/80 text-zinc-500 group-hover:text-zinc-400"
              )}>
                <Upload size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200 tracking-tight">
                  {isDragActive ? "READY TO DROP" : "ADD IMAGE"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium italic opacity-75">
                  DROP FILE OR BROWSE
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  </div>
);
}
