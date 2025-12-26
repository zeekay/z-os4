import React from 'react';
import { DictionaryWindow as DictionaryContent } from '@z-os/apps';

interface DictionaryWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const DictionaryWindow: React.FC<DictionaryWindowProps> = ({ onClose, onFocus }) => {
  return <DictionaryContent onClose={onClose} onFocus={onFocus} />;
};

export default DictionaryWindow;
