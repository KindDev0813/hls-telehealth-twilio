import React from 'react';
import { joinClasses } from '../../utils';
import { Heading } from '../Heading';

export interface AlertProps {
  className?: string;
  title: string;
  titleAfterIcon?: boolean;
  icon?: React.ReactChild;
  content: React.ReactChild;
  contentBeforeIcon?: boolean;
  footer?: React.ReactChild;
}

export const Alert = ({
  className,
  content,
  contentBeforeIcon,
  footer,
  icon,
  title,
  titleAfterIcon,
}: AlertProps) => {
  const Content = () => <div className="my-3">{content}</div>;
  return (
    <div className={joinClasses('flex flex-col justify-center items-center text-center', className)}>
      {!titleAfterIcon && <Heading>{title}</Heading>}
      {contentBeforeIcon && <Content />}
      {icon && (
        <div
          className={!titleAfterIcon && !contentBeforeIcon ? 'mt-10' : 'mb-10'}
        >
          {icon}
        </div>
      )}
      {titleAfterIcon && <Heading>{title}</Heading>}
      {!contentBeforeIcon && <Content />}
      {footer && footer}
    </div>
  );
};
