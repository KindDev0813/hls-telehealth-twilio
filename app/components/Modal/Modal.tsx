import { joinClasses } from '../../utils';

export interface ModalProps {
  backdropClick?: () => void;
  backgroundClassName?: string;
  backdropClassName?: string;
  children: React.ReactNode;
  isVisible: boolean;
  modalStyle?: any;
}

export const Modal = ({
  backdropClassName = 'bg-[#000000BF]',
  backdropClick,
  backgroundClassName = 'bg-white',
  children,
  isVisible,
  modalStyle,
}: ModalProps) => {
  return (
    isVisible && (
      <div
        className={joinClasses(
          'fixed inset-0 z-50 overflow-auto flex items-center justify-center',
          backdropClassName
        )}
        onClick={backdropClick}
      >
        <div
          className={joinClasses(
            'relative w-full mx-10 max-w-sm m-auto rounded-lg',
            backgroundClassName
          )}
          style={modalStyle}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    )
  );
};
