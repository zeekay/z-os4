import React from 'react';
import { StocksWindow as StocksContent } from '@z-os/apps';

interface StocksWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const StocksWindow: React.FC<StocksWindowProps> = ({ onClose, onFocus }) => {
  return <StocksContent onClose={onClose} onFocus={onFocus} />;
};

export default StocksWindow;
