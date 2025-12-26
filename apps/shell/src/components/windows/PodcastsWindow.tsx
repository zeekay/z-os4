import React from 'react';
import { PodcastsWindow as PodcastsContent } from '@z-os/apps';

interface PodcastsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const PodcastsWindow: React.FC<PodcastsWindowProps> = ({ onClose, onFocus }) => {
  return <PodcastsContent onClose={onClose} onFocus={onFocus} />;
};

export default PodcastsWindow;
