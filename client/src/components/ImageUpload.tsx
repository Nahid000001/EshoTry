import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (base64Image: string) => void;
  language?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ onImageUpload, language = 'en', disabled = false, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert(language === 'bn' ? 'ছবির সাইজ ১০ এমবির কম হতে হবে' : 'Image size must be less than 10MB');
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        setPreview(result);
        onImageUpload(base64);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert(language === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে' : 'Error reading image');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert(language === 'bn' ? 'ছবি প্রক্রিয়াকরণে সমস্যা' : 'Error processing image');
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  if (preview) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-full h-32 object-cover rounded-lg border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'bn' ? 'ছবি প্রক্রিয়াকরণ হচ্ছে...' : 'Processing image...'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">
              {language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium">
              {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'bn' 
                ? 'ড্র্যাগ করুন বা ক্লিক করুন' 
                : 'Drag and drop or click to select'}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-1" />
          {language === 'bn' ? 'ফাইল নির্বাচন' : 'Choose File'}
        </Button>
        
        <Button
          variant="outline" 
          size="sm"
          onClick={handleCameraCapture}
          disabled={disabled || isProcessing}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-1" />
          {language === 'bn' ? 'ক্যামেরা' : 'Camera'}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        {language === 'bn' 
          ? 'সর্বোচ্চ ১০ এমবি • JPG, PNG, WebP' 
          : 'Max 10MB • JPG, PNG, WebP'}
      </p>
    </div>
  );
}