import { RegisterOptions, UseFormRegister } from 'react-hook-form';
import { joinClasses } from '../../utils';

export interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  isDark?: boolean;
  register?: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
}

export const Input = ({
  className,
  isDark,
  name,
  register,
  registerOptions,
  ...props
}: InputProps) => {
  const classes = joinClasses(
    'px-3 py-2 border rounded-md',
    isDark ? 'bg-black border-dark' : 'border-light',
    className
  );

  return (
    <input
      className={classes}
      {...(register ? register(name, registerOptions) : {})}
      {...props}
    />
  );
};
