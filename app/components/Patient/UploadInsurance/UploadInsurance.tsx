/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';

export interface UploadInsuranceProps {
  onSubmit?: (value: any) => void;
}

export const UploadInsurance = ({ onSubmit }: UploadInsuranceProps) => {
  const inputRef = useRef(null);

  return (
    <div
      className="border-2 border-primary rounded-md flex flex-col items-center justify-center h-[225px] w-[225px] cursor-pointer"
      onClick={() => inputRef?.current?.click()}
    >
      <img alt="Upload Image" className="mb-6" src="/icons/upload.svg" height={48} width={69} />
      <input ref={inputRef} className="hidden" type="file" accept="image/*" />
      <div className="text-primary">Upload Image</div>
      <div className="text-dark">Size limit: 4mb</div>
    </div>
  );
};
