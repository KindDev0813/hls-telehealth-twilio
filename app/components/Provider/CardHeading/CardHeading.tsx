export interface CardHeadingProps {
  children: React.ReactNode;
}

export const CardHeading = ({ children }: CardHeadingProps) => {
  return (
    <h1 className="text-2xl text-primary whitespace-pre-wrap">{children}</h1>
  );
};
