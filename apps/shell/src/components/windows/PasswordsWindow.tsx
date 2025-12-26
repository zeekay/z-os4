import React from 'react';
import { PasswordsWindow as PasswordsContent } from '@z-os/apps';

interface PasswordsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const PasswordsWindow: React.FC<PasswordsWindowProps> = ({ onClose, onFocus }) => {
  return <PasswordsContent onClose={onClose} onFocus={onFocus} />;
};

export default PasswordsWindow;
