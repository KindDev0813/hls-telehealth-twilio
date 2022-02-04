import { Heading } from '../../Heading';
import { Header } from '../Header';
import { PoweredByTwilio } from '../../PoweredByTwilio';

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      <div>
        <Header />
      </div>
      <div className="max-w-screen-2xl mx-auto flex-grow">
        {title && <Heading>{title}</Heading>}
        {children}
      </div>
      <footer className="pt-2 pb-5">
        <PoweredByTwilio className="mx-auto" />
      </footer>
    </div>
  );
};
