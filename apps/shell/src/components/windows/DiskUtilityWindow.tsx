import React from 'react';
import { DiskUtilityWindow as DiskUtilityContent } from '@z-os/apps';

interface DiskUtilityWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const DiskUtilityWindow: React.FC<DiskUtilityWindowProps> = ({ onClose, onFocus }) => {
  return <DiskUtilityContent onClose={onClose} onFocus={onFocus} />;
};

export default DiskUtilityWindow;
