
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AvatarUploadProps {
  onUpload: (imageUrl: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onUpload(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={triggerFileSelect}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
      >
        <div className="text-gray-400 text-4xl mb-4">📷</div>
        <p className="text-gray-600 mb-2">Click to upload a photo</p>
        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="flex gap-2">
        <Button onClick={triggerFileSelect} variant="outline" className="flex-1">
          Choose File
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Your photo stays private and is only used to create your avatar
      </div>
    </div>
  );
};
