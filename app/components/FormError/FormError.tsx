import { ALPHA_REGEX, EMAIL_REGEX, PHONE_REGEX, ZIP_REGEX } from '../../utils';

export interface FormErrorProps {
  children?: React.ReactNode;
  pattern?: RegExp;
  required?: boolean;
}

export const FormError = ({ children, pattern, required }: FormErrorProps) => {
  return (
    <div className="font-bold text-sm text-primary">
      {required && 'Required'}
      {pattern === ALPHA_REGEX && 'Letters only'}
      {pattern === EMAIL_REGEX && 'Email address must be valid'}
      {pattern === PHONE_REGEX && 'Phone number must be valid'}
      {pattern === ZIP_REGEX && 'Zip must be valid'}
      {children}
    </div>
  );
};
