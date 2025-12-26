import React from 'react';
import { PreviewWindow as PreviewContent } from '@z-os/apps';

interface PreviewWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const PreviewWindow: React.FC<PreviewWindowProps> = ({ onClose, onFocus }) => {
  return <PreviewContent onClose={onClose} onFocus={onFocus} />;
};

export default PreviewWindow;
