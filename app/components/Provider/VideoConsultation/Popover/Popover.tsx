import React, { useState } from 'react';
import { Modal } from '../../../Modal';
import { usePopper } from 'react-popper';

export interface PopoverProps {
  children: React.ReactNode;
  close: () => void;
  referenceElement?: any;
  isVisible: boolean;
}

export const Popover = ({
  children,
  close,
  referenceElement,
  isVisible,
}: PopoverProps) => {
  const [popperElement, setPopperElement] = useState(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top-end',
  });

  return (
    isVisible && (
      <div className="fixed inset-0 z-50" onClick={() => close()}>
        <div
          className="bg-[#000000BF] text-white border border-dark rounded"
          ref={setPopperElement}
          style={styles.popper}
          onClick={(event) => {
            event.stopPropagation();
          }}
          {...attributes.popper}
        >
          {children}
        </div>
      </div>
    )
  );
};
