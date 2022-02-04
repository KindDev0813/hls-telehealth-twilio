import { useState } from 'react';
import { Button } from '../../Button';
import { Form } from '../../Form/Form';
import { ALPHA_REGEX, EMAIL_REGEX, PHONE_REGEX } from '../../../utils';
import { Input } from '../../Input';
import { Radio } from '../../Radio';
import { Select } from '../../Select';

export interface InfoFormProps {
  onSubmit?: (value: any) => void;
}

export const InfoForm = ({ onSubmit }: InfoFormProps) => {
  const [value, setValue] = useState<any>({});
  return (
    <>
      <p className="text-dark">This will be shared with your doctor.</p>
      <Form
        className="flex flex-col h-full"
        onChange={setValue}
        onSubmit={onSubmit}
      >
        <Input
          className="my-2"
          name="firstName"
          placeholder="First Name"
          registerOptions={{
            required: true,
            pattern: ALPHA_REGEX,
          }}
        />
        <Input
          className="my-2"
          name="lastName"
          placeholder="Last Name"
          registerOptions={{
            required: true,
            pattern: ALPHA_REGEX,
          }}
        />
        <Input
          className="my-2"
          name="phoneNumber"
          placeholder="Phone Number"
          registerOptions={{
            required: true,
            pattern: PHONE_REGEX,
          }}
        />
        <Input
          type="email"
          name="email"
          className="my-2"
          placeholder="Email"
          registerOptions={{
            required: true,
            pattern: EMAIL_REGEX,
          }}
        />
        <div className="mt-3">Will you need a translator?</div>
        <Radio name="needTranslator" label="No" value="No" />
        <Radio name="needTranslator" label="Yes" value="Yes" />
        {value.needTranslator === 'Yes' && (
          <Select
            className="my-2"
            placeholder="Language"
            options={[{ value: 'Spanish ' }]}
            name="language"
          />
        )}
        <div className="mt-4">I am</div>
        <Radio name="gender" label="Male" value="Male" />
        <Radio name="gender" label="Female" value="Female" />
        <Radio name="gender" label="Other" value="Other" />
        <div className="my-5 mx-auto max-w-[250px] w-full">
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
      </Form>
    </>
  );
};
