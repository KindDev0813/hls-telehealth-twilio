import { useState } from 'react';
import { Card } from '../../Card';
import { CardHeading } from '../CardHeading';
import { Button, ButtonVariant } from '../../Button';
import { Input } from '../../Input';

export interface InviteCardProps {
  className?: string;
}

export const InviteCard = ({ className }: InviteCardProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  return (
    <Card className={className}>
      <CardHeading>Welcome, Dr. Santos</CardHeading>
      <div className="px-5">
        <p className="my-5 text-dark">
          To invite someone to your room, we’ll share a link via text. Input a
          phone number below.
        </p>
        <Input
          className="w-full"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <div className="my-3 text-center">
          <Button variant={ButtonVariant.secondary} outline>
            Send Text Invite
          </Button>
        </div>
      </div>
    </Card>
  );
};
