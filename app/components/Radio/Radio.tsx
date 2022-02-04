import { RegisterOptions, UseFormRegister } from 'react-hook-form';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  register?: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
}

export const Radio = ({
  className,
  label,
  name,
  register,
  registerOptions,
  value,
  ...props
}: InputProps) => {
  return (
    <label className="flex items-center my-1">
      <input
        className="ml-3 mr-2"
        type="radio"
        name={name}
        value={value}
        {...(register ? register(name, registerOptions) : {})}
        {...props}
      />
      {label}
    </label>
  );
};
