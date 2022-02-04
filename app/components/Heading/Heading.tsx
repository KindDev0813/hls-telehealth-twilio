export interface HeadingProps {
  children: React.ReactNode;
}

export const Heading = ({ children }: HeadingProps) => {
  return (
    <h1 className="my-3 text-2xl text-center text-primary whitespace-pre-wrap">
      {children}
    </h1>
  );
};
