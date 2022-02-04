import { RegisterOptions, UseFormRegister } from 'react-hook-form';
import { joinClasses } from '../../utils';

export interface SelectProps
  extends React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  isDark?: boolean;
  register?: UseFormRegister<any>;
  registerOptions?: RegisterOptions;
  options: { label?: string; value: any }[];
}

export const Select = ({
  className,
  isDark,
  name,
  options,
  placeholder,
  register,
  registerOptions = {},
  ...props
}: SelectProps) => {
  return (
    <select
      className={joinClasses(
        'px-3 py-2 border border-light rounded-md text-dark',
        isDark && 'bg-black border-dark',
        className
      )}
      {...(register ? register(name, registerOptions) : {})}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.label ?? option.value} value={option.value}>
          {option.label ?? option.value}
        </option>
      ))}
    </select>
  );
};
