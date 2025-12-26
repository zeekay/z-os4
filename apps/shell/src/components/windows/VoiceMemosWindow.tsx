import React from 'react';
import { VoiceMemosWindow as VoiceMemosContent } from '@z-os/apps';

interface VoiceMemosWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const VoiceMemosWindow: React.FC<VoiceMemosWindowProps> = ({ onClose, onFocus }) => {
  return <VoiceMemosContent onClose={onClose} onFocus={onFocus} />;
};

export default VoiceMemosWindow;
