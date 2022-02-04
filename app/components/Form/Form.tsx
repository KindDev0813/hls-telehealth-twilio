import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { joinClasses } from '../../utils';
import { FormError } from '../FormError';

export const Form = ({
  className,
  defaultValues = {},
  children,
  onChange = null,
  onSubmit,
}) => {
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      onChange && onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  return (
    <form className={joinClasses(className)} onSubmit={handleSubmit(onSubmit)}>
      {React.Children.map(children, (child) => {
        return child?.props.name ? (
          <>
            {React.createElement(child.type, {
              ...{
                ...child.props,
                register: register,
                key: child.props.name,
              },
            })}
            {child.props.registerOptions?.required &&
              errors[child.props.name] &&
              errors[child.props.name].type === 'required' && (
                <FormError required />
              )}
            {child.props.registerOptions?.pattern &&
              errors[child.props.name] &&
              errors[child.props.name].type === 'pattern' && (
                <FormError pattern={child.props.registerOptions?.pattern} />
              )}
          </>
        ) : (
          child
        );
      })}
    </form>
  );
};
