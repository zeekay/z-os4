import React from 'react';
import { ConsoleWindow as ConsoleContent } from '@z-os/apps';

interface ConsoleWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ConsoleWindow: React.FC<ConsoleWindowProps> = ({ onClose, onFocus }) => {
  return <ConsoleContent onClose={onClose} onFocus={onFocus} />;
};

export default ConsoleWindow;
