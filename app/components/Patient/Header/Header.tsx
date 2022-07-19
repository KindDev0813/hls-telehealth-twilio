export interface HeaderProps {
  name?: string;
}

export const Header = ({ name = 'Cloud City Healthcare' }: HeaderProps) => {
  return (
    <div className="flex items-center justify-center h-16 w-full bg-white shadow-patientHeader">
      <h1 className="font-bold text-2xl text-primary">{name}</h1>
    </div>
  );
};
