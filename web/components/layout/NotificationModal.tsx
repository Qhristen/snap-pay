'use client';

import { Modal } from '@/components/ui/Modal';
import { NotificationList } from './NotificationList';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Notifications"
    >
      <div className="-mx-6 -mb-6">
        <NotificationList onItemClick={onClose} />
      </div>
    </Modal>
  );
}
