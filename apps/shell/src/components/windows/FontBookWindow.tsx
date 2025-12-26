import React from 'react';
import { FontBookWindow as FontBookContent } from '@z-os/apps';

interface FontBookWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const FontBookWindow: React.FC<FontBookWindowProps> = ({ onClose, onFocus }) => {
  return <FontBookContent onClose={onClose} onFocus={onFocus} />;
};

export default FontBookWindow;
