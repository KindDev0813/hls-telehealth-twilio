import { Button } from '../../Button';
import { Form } from '../../Form';
import { Input } from '../../Input';
import { Radio } from '../../Radio';
import { Select } from '../../Select';

export interface InsuranceFormProps {
  onSubmit?: (value: any) => void;
}

export const InsuranceForm = ({ onSubmit }: InsuranceFormProps) => {
  return (
    <Form className="flex flex-col h-full" onSubmit={onSubmit}>
      <div className="mt-2">Do you have insurance?</div>
      <Radio name="haveInsurance" label="Yes" value="Yes" />
      <Radio name="haveInsurance" label="No" value="No" />
      <Input className="my-2" placeholder="Member ID" name="memberId" />
      <Select
        className="my-2"
        name="healthPlan"
        placeholder="Health Plan"
        options={[{ value: 'Plan 1' }]}
      />
      <div className="mt-2">Are you the primary member?</div>
      <Radio name="isPrimaryMember" label="Yes" value="Yes" />
      <Radio name="isPrimaryMember" label="No" value="No" />
      <div className="my-5 mx-auto max-w-[250px] w-full">
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </div>
    </Form>
  );
};
