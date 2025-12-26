import React from 'react';
import { MapsWindow as MapsContent } from '@z-os/apps';

interface MapsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const MapsWindow: React.FC<MapsWindowProps> = ({ onClose, onFocus }) => {
  return <MapsContent onClose={onClose} onFocus={onFocus} />;
};

export default MapsWindow;
