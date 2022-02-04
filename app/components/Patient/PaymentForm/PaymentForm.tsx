import { useRouter } from 'next/router';
import { US_STATES, ZIP_REGEX } from '../../../utils';
import { Button } from '../../Button';
import { Form } from '../../Form';
import { Input } from '../../Input';
import { Select } from '../../Select';

export interface PaymentFormProps {}

export const PaymentForm = ({}: PaymentFormProps) => {
  const router = useRouter();

  const onSubmit = async (data) => {
    // TODO: Integrate Stripe or payment processing
    // console.log(data);
    router.push(`/patient/on-demand/payment/received`);
  }

  return (
    <Form className="h-full" onSubmit={onSubmit}>
      <div className="mt-2 text-xs font-bold">Card Information:</div>
      <Input
        className="my-2 w-full"
        placeholder="Card Number"
        name="cardNumber"
        registerOptions={{
          required: true,
        }}
      />
      <Input
        className="my-2 w-full"
        placeholder="Cardholder Name"
        name="cardholderName"
        registerOptions={{
          required: true,
        }}
      />
      <Input
        className="my-2 inline-block w-[49%] mr-[2%]"
        placeholder="Exp. Date"
        name="expDate"
        registerOptions={{
          required: true,
        }}
      />
      <Input
        className="my-2 inline-block w-[49%]"
        placeholder="CCV/CVC"
        name="ccv"
        registerOptions={{
          required: true,
        }}
      />
      <div className="mt-4 text-xs font-bold">Billing Information:</div>
      <Input
        className="my-2 w-full"
        placeholder="Billing Address"
        name="billingAddress"
      />
      <Input className="my-2 w-full" placeholder="City" name="city" />
      <Select
        className="my-2 inline-block w-[49%] mr-[2%]"
        placeholder="State"
        name="state"
        options={US_STATES.map((state) => ({ value: state }))}
      />
      <Input
        className="my-2 inline-block w-[49%]"
        placeholder="Zip"
        name="zip"
        registerOptions={{
          pattern: ZIP_REGEX,
        }}
      />
      <div className="my-5 mx-auto max-w-[250px] w-full">
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </div>
    </Form>
  );
};
