export interface HeaderProps {
  name?: string;
}

export const Header = ({ name = 'Owl Health' }: HeaderProps) => {
  return (
    <div className="flex items-center justify-center h-16 w-full bg-white">
      <div className="font-bold text-2xl text-primary">{name}</div>
    </div>
  );
};
