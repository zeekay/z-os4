import React from 'react';
import { NewsWindow as NewsContent } from '@z-os/apps';

interface NewsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const NewsWindow: React.FC<NewsWindowProps> = ({ onClose, onFocus }) => {
  return <NewsContent onClose={onClose} onFocus={onFocus} />;
};

export default NewsWindow;
