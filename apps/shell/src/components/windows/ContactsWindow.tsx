import React from 'react';
import { ContactsWindow as ContactsContent } from '@z-os/apps';

interface ContactsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ContactsWindow: React.FC<ContactsWindowProps> = ({ onClose, onFocus }) => {
  return <ContactsContent onClose={onClose} onFocus={onFocus} />;
};

export default ContactsWindow;
