import React, { useState } from 'react';
import { Button } from '../../../Button';
import { Input } from '../../../Input';
import { Select } from '../../../Select';
import { Popover, PopoverProps } from '../Popover';

export interface InviteParticipantPopoverProps
  extends Omit<PopoverProps, 'children'> {
  close: () => void;
}

export const InviteParticipantPopover = ({
  close,
  ...popoverProps
}: InviteParticipantPopoverProps) => {
  const [inviteMethod, setInviteMethod] = useState('SMS');
  const [phoneNumber, setPhoneNumber] = useState('');

  function submitInvite(event) {
    event.preventDefault();
    // TODO - Submit form to back-end
    console.log(inviteMethod, phoneNumber);
    setPhoneNumber('');
    close();
  }

  return (
    <Popover {...popoverProps} close={close}>
      <div className="border-b border-border-primary">
        <h3 className="my-3 px-3">Invite to Visit</h3>
      </div>
      <form className="p-3" onSubmit={submitInvite}>
        <div className="mb-3 font-bold text-xs">Invite Via</div>
        <Select
          className="mr-2"
          isDark
          options={[{ value: 'SMS' }]}
          value={inviteMethod}
          onChange={(e) => setInviteMethod(e.target.value)}
        />
        <Input
          className="mx-2"
          isDark
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <Button type="submit" onClick={close}>
          Invite
        </Button>
      </form>
    </Popover>
  );
};
