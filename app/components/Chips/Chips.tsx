import { joinClasses } from '../../utils';

export interface ChipsProps {
  onChange: (value: string[]) => void;
  options?: Chip[];
  selected?: string[];
}

interface Chip {
  label?: string;
  value: string;
}

export const Chips = ({ onChange, options, selected }: ChipsProps) => {
  function toggleChipSelection(value) {
    let newValue;
    if (selected.includes(value)) {
      newValue = selected.filter((v) => v !== value);
    } else {
      newValue = [...selected, value];
    }
    onChange(newValue);
  }

  return (
    <div className="flex flex-wrap justify-center">
      {options.map((option) => (
        <div
          className={joinClasses(
            'border p-2 m-1 rounded-full text-sm cursor-pointer',
            selected.includes(option.value)
              ? 'border-primary text-primary'
              : 'border-dark text-dark'
          )}
          key={option.value}
          onClick={() => toggleChipSelection(option.value)}
        >
          {option.label ?? option.value}
        </div>
      ))}
    </div>
  );
};
