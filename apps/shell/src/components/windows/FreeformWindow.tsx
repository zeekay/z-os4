import React from 'react';
import { FreeformWindow as FreeformContent } from '@z-os/apps';

interface FreeformWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const FreeformWindow: React.FC<FreeformWindowProps> = ({ onClose, onFocus }) => {
  return <FreeformContent onClose={onClose} onFocus={onFocus} />;
};

export default FreeformWindow;
