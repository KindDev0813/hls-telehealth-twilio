import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import React from 'react';
import '../css/global.css';
import { TwilioPage } from '../types'

function hasLayout(Component: NextPage | TwilioPage): Component is TwilioPage {
  return (Component as TwilioPage).Layout !== null && (Component as TwilioPage).Layout !== undefined;
}

function MyApp({ Component, pageProps }: AppProps) {
  const Layout = hasLayout(Component) ? (Component as TwilioPage).Layout : React.Fragment
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
