import React from 'react';
import { BooksWindow as BooksContent } from '@z-os/apps';

interface BooksWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const BooksWindow: React.FC<BooksWindowProps> = ({ onClose, onFocus }) => {
  return <BooksContent onClose={onClose} onFocus={onFocus} />;
};

export default BooksWindow;
