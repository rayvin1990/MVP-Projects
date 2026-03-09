import React, { useState, useRef } from 'react';
import { PromptGenerationRequest } from '@/lib/types';

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelected, disabled = false }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size cannot exceed 10MB');
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onImageSelected(reader.result as string);
    };
    reader.onerror = () => {
      alert('Failed to read image');
    };
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-gray-400 rounded-lg p-8 text-center transition-all cursor-pointer bg-white ${
          dragActive ? 'border-blue-500 bg-blue-50' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : onButtonClick}
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#9ca3af',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 mb-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: '#6b7280' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p 
            className="text-lg mb-2"
            style={{ color: '#000000' }}
          >
            Click or drag to upload image
          </p>
          <p 
            className="text-sm"
            style={{ color: '#6b7280' }}
          >
            Supports JPG, PNG, GIF, max 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
