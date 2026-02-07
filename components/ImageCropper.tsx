import React, { useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { RotateCw, Check, ArrowLeft } from 'lucide-react';
import { LegoButton } from './LegoButton';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (croppedImageBlob: Blob) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onComplete }) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleRotate = () => {
    const cropper = cropperRef.current?.cropper;
    cropper?.rotate(90);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          onComplete(blob);
        }
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-700">Adjust Image</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-red-500">
            <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="h-[50vh] w-full bg-[#1a1a1a]">
        <Cropper
          src={imageSrc}
          style={{ height: '100%', width: '100%' }}
          initialAspectRatio={1}
          guides={true}
          ref={cropperRef}
          viewMode={1}
          background={false}
          responsive={true}
        />
      </div>

      <div className="p-6 flex justify-between items-center bg-white gap-4">
        <LegoButton onClick={handleRotate} variant="secondary" icon={<RotateCw size={20} />}>
          Rotate
        </LegoButton>
        <LegoButton onClick={handleCrop} variant="primary" icon={<Check size={20} />}>
          Build It!
        </LegoButton>
      </div>
    </div>
  );
};