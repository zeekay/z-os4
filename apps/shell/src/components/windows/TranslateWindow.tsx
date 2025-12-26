import React from 'react';
import { TranslateWindow as TranslateContent } from '@z-os/apps';

interface TranslateWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const TranslateWindow: React.FC<TranslateWindowProps> = ({ onClose, onFocus }) => {
  return <TranslateContent onClose={onClose} onFocus={onFocus} />;
};

export default TranslateWindow;
