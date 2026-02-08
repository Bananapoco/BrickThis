import React, { useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { RotateCw, Check, ArrowLeft } from 'lucide-react';
import { LegoButton } from './LegoButton';
import 'cropperjs/dist/cropper.css';

interface ImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (croppedImageBlob: Blob) => void;
}

const MAX_IMAGE_DIMENSION = 1200;

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCancel, onComplete }) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleRotate = () => {
    cropperRef.current?.cropper?.rotate(90);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    // Get cropped canvas, then downscale if needed to reduce upload size
    const sourceCanvas = cropper.getCroppedCanvas();
    const { width, height } = sourceCanvas;

    let targetW = width;
    let targetH = height;

    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
      targetW = Math.round(width * scale);
      targetH = Math.round(height * scale);
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetW;
    outputCanvas.height = targetH;
    const ctx = outputCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    }

    outputCanvas.toBlob(
      (blob) => {
        if (blob) onComplete(blob);
      },
      'image/jpeg',
      0.85 // Compress to 85% quality JPEG
    );
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

export default ImageCropper;
// Keep named export for backwards compatibility
export { ImageCropper };
