import { Heading } from '../../Heading';
import { Header } from '../Header';
import { PoweredByTwilio } from '../../PoweredByTwilio';
import React from "react";

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
      <div className="max-w-sm w-full mx-auto flex flex-grow justify-center md:items-center lg:items-center xl:items-center">
        {title && <Heading>{title}</Heading>}
        <div>{children}</div>
      </div>
      <footer className="pt-2 pb-5">
        <PoweredByTwilio className="mx-auto" />
      </footer>
    </div>
  );
};
