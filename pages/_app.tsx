import { useCallback } from 'react';
import type {AppProps} from 'next/app';
import {createTheme, NextUIProvider} from '@nextui-org/react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import Script from 'next/script';
import {MetaMaskProvider} from 'metamask-react';
import variables from '@space/styles/variables.module.scss';

const baseTheme = {
  colors: {
    primary: variables.baseColor,
    link: variables.baseColor,
  }
};

const darkTheme = createTheme({
  type: 'dark',
  theme: baseTheme
});

function SpaceApp({ Component, pageProps }: AppProps) {

  const onLoad = useCallback(() => {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    const gtag = (...args:any) => {
      w.dataLayer.push(...args);
    }
    gtag('js', new Date());
    gtag('config', 'G-2LWYCR888X');
  }, []);

  return (
    <NextThemesProvider
      enableSystem={false}
      defaultTheme='dark'
      attribute="class"
      value={{
        dark: darkTheme.className
      }}
    >
      <NextUIProvider>
        <MetaMaskProvider>
          <Component {...pageProps} />
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-2LWYCR888X" onLoad={onLoad} />
        </MetaMaskProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default SpaceApp;
