import { joinClasses } from '../../utils';

export interface IconProps {
  className?: string;
  name: string;
  outline?: boolean;
}

export const Icon = ({ className, name, outline }: IconProps) => {
  return (
    <span
      className={joinClasses(
        outline ? 'material-icons-outlined' : 'material-icons',
        className
      )}
    >
      {name}
    </span>
  );
};
