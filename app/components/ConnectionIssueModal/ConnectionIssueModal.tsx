import React from 'react';
import { Button, ButtonVariant } from '../Button';
import { Modal } from '../Modal';

export interface ConnectionIssueModalProps {
  close: () => void;
  isVisible: boolean;
}

export const ConnectionIssueModal = ({
  close,
  isVisible,
}: ConnectionIssueModalProps) => {
  return (
    <Modal backdropClick={close} isVisible={isVisible}>
      <p className="my-4 text-center text-primary">
        You’re experiencing connnection issues
      </p>
      <div className="my-2 text-center">
        <Button className="my-1 w-full max-w-[250px]" onClick={close}>
          Switch to Phone Consultation
        </Button>
        <Button
          className="my-1 w-full max-w-[250px]"
          variant={ButtonVariant.secondary}
          outline
          onClick={close}
        >
          Continue with Video Visit
        </Button>
      </div>
    </Modal>
  );
};
