import * as Sentry from '@sentry/react';
import {useEffect} from 'react';
import {AppProps} from 'next/app';
import {createTheme, NextUIProvider} from '@nextui-org/react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import Script from 'next/script';
import {
  wagmiClient,
  ethereumClient,
  WagmiConfig,
  Web3Modal,
  WALLET_CONNECT,
} from '@space/components/Wallet/connector';
import {ToastContainer} from 'react-toastify';
import {HOST, DAO} from '../hooks/api';
import '@space/styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import variables from '@space/styles/variables.module.scss';

const baseTheme = {
  colors: {
    primary: variables.baseColor,
    link: variables.baseColor,
  },
};

const darkTheme = createTheme({
  type: 'dark',
  theme: baseTheme,
});

const Guard = () => {
  try {
    fetch(`https://cloudflare.com/cdn-cgi/trace`)
      .then(r => r.text())
      .then(t => {
        if (/loc=RU/.test(t)) {
          window.location.pathname = '/guard.png';
        }
      });
  } catch (e) {
    console.error(e);
  }
};

const Fallback = ({error}: any) => {
  return (
    <div style={{textAlign: 'center', marginTop: '5rem'}}>
      <div>Відбулась помилка 🤪</div>
      <div>
        <a href={DAO} target="_blank" rel="noreferrer">
          Підтримка
        </a>
      </div>
      <div style={{marginTop: '3rem', color: 'grey'}}>{error?.toString()}</div>
    </div>
  );
};

function SpaceApp({Component, pageProps}: AppProps) {
  const onLoad = () => {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    function gtag(...args: any) {
      w.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-2LWYCR888X');
  };

  useEffect(() => {
    Guard();
    if (window?.location?.hostname === HOST) {
      Sentry.init({
        dsn:
          'https://30689384c51c4e6ba3918b30cc428bf5@o4503901926850560.ingest.sentry.io/4503901965778944',
      });
    }
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={Fallback}>
      <NextThemesProvider
        enableSystem={false}
        defaultTheme="dark"
        attribute="class"
        value={{
          dark: darkTheme.className,
        }}
      >
        <NextUIProvider>
          <WagmiConfig client={wagmiClient}>
            <ToastContainer theme="dark" />
            <Component {...pageProps} />
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-2LWYCR888X"
              onLoad={onLoad}
            />
          </WagmiConfig>
        </NextUIProvider>
      </NextThemesProvider>
      <Web3Modal
        projectId={WALLET_CONNECT}
        ethereumClient={ethereumClient}
        themeMode="dark"
        themeZIndex={999}
      />
    </Sentry.ErrorBoundary>
  );
}

export default SpaceApp;
