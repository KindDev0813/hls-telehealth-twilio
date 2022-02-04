import { joinClasses } from '../../utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  const classes = joinClasses('bg-white shadow-card p-5', className);

  return <div className={classes}>{children}</div>;
};
