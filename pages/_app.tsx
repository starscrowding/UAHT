import type {AppProps} from 'next/app';
import {createTheme, NextUIProvider} from '@nextui-org/react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
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
        </MetaMaskProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default SpaceApp;
