import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { Select } from '../Select';
import invitationService from '../../services/invitationService'
import { useVisitContext } from '../../state/VisitContext';
import { TelehealthRole } from '../../types';

export interface InviteParticipantModalProps {
  close: () => void;
  isVisible: boolean;
  hasNameInput: boolean;
  role: TelehealthRole;
}

export const InviteParticipantModal = ({
  close,
  isVisible,
  hasNameInput,
  role,
}: InviteParticipantModalProps) => {
  const {user, visit} = useVisitContext();
  
  const [inviteMethod, setInviteMethod] = useState('SMS');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');

  async function submitInvite(event) {
    event.preventDefault();
    // TODO - Submit form to back-end
    if(name) {
      user.name = name;
    }
    await invitationService.inviteVisitor(user, phoneNumber, visit.id, role);
    console.log(inviteMethod, phoneNumber);
    setPhoneNumber('');
    setName('');
    close();
  }

  return (
    <Modal backdropClick={close} isVisible={isVisible}>
      <div className="mb-3 border-b border-border-primary">
        <h3 className="my-3 px-5">Invite to Visit</h3>
      </div>
      <form className="py-3 px-5" onSubmit={async (evt) =>  await submitInvite(evt)}>
        <div className="flex mb-5 items-center justify-center">
          <div className="flex-grow">
            <label className="font-bold">Invite Via:</label>
          </div>
          <div className="flex-grow">
            <Select
              className="w-full"
              options={[{ value: 'SMS' }]}
              value={inviteMethod}
              onChange={(e) => setInviteMethod(e.target.value)}
            />
          </div>
        </div>
        {hasNameInput && 
        <div className="my-5">
          <Input
            className="w-full"
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        }
        <div className="my-5">
          <Input
            className="w-full"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>
        <div className="my-2 text-center">
          <Button type="submit">Invite</Button>
        </div>
      </form>
    </Modal>
  );
};
