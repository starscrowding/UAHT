import {useEffect, useState} from 'react';
import {useMetaMask} from 'metamask-react';
import {Loading} from '@nextui-org/react';
import styles from './metamask.module.scss';

export const POLYGON_ID = '0x89'; // 137
export const POLYGON = {
  chainId: POLYGON_ID,
  chainName: 'Polygon Mainnet',
  rpcUrls: ['https://polygon-rpc.com/'],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  blockExplorerUrls: ['https://polygonscan.com'],
};

export const Address = ({account = ''}: {account: string}) => {
  return (
    <a
      className={styles.copy}
      onClick={() => navigator.clipboard.writeText(account)}
    >{`${account?.slice(0, 4)}...${account?.slice(-4)}`}</a>
  );
};

export const MetamaskStatus = () => {
  const MM = useMetaMask();
  const [isMobile, setIsMobile] = useState<boolean>();
  const [step, setStep] = useState(0);

  const switchNetwork = async () => {
    try {
      await MM.switchChain(POLYGON_ID);
    } catch (err) {
      // no Polygon added
      if ((err as any)?.code === 4902) {
        MM.addChain(POLYGON);
      }
    }
  };

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  return (
    <div>
      {MM.status === 'connecting' || (MM.status === 'initializing' && <Loading type="points" />)}
      {MM.status === 'unavailable' && (
        <>
          {step === 0 && (
            <a
              onClick={() => {
                window.open('https://metamask.io/', '_blank');
                setStep(1);
              }}
            >
              Встанови
            </a>
          )}
          {step === 1 && (
            <>
              {isMobile ? (
                <a href="https://metamask.app.link/dapp/uaht.io" target="_blank" rel="noreferrer">
                  Відкрий у додатку
                </a>
              ) : (
                <a onClick={() => location.reload()}>Онови сторінку</a>
              )}
            </>
          )}
        </>
      )}
      {MM.status === 'notConnected' && <a onClick={() => MM.connect()}>Підключи</a>}
      {MM.status === 'connected' && (
        <>
          {MM.chainId !== POLYGON_ID && <a onClick={() => switchNetwork()}>Активуй Polygon</a>}
          {MM.chainId === POLYGON_ID && <Address account={MM.account} />}
        </>
      )}
    </div>
  );
};
