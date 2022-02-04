/* eslint-disable @next/next/no-img-element */
import { Media } from "@twilio/conversations";
import { useState, useEffect } from 'react';

interface MediaMessageProps {
  media: Media[];
  isSelf: boolean;
  name: string;
}

export function formatFileSize(bytes: number, suffixIndex = 0): string {
  const suffixes = ['bytes', 'KB', 'MB', 'GB'];
  if (bytes < 1000) return +bytes.toFixed(2) + ' ' + suffixes[suffixIndex];
  return formatFileSize(bytes / 1024, suffixIndex + 1);
}

export default function MediaMessage({ media, isSelf, name }: MediaMessageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  
  function handleClick() {
    media[0].getContentTemporaryUrl().then(url => {
      const anchorEl = document.createElement('a');

      anchorEl.href = url;
      anchorEl.target = '_blank';
      anchorEl.rel = 'noopener';

      // setTimeout is needed in order to open files in iOS Safari.
      setTimeout(() => {
        anchorEl.click();
      });
    });
  };

  useEffect(() => {
    if (media.length) {
      media[0].getContentTemporaryUrl().then(url => {
        setImageUrl(url);
      });
    }
  }, [media])

  return (
    <>
    <div className={'text-sm text-secondary mb-1 mt-3'}>{name}</div>
    <div className={!isSelf ? 'text-right flex justify-end' : ''}>
      <div 
        className={'mb-5 flex items-center w-40 h-40 border rounded-2xl max-w-sm border-gray-300 cursor-pointer'} 
        onClick={handleClick}>
        <img alt="User uploaded media image" className='w-auto h-auto justify-center' src={imageUrl} />
      </div>
    </div>
    </>
  );
}