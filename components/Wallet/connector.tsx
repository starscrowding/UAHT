import {useEffect, useState} from 'react';
import {EthereumClient, w3mConnectors, w3mProvider} from '@web3modal/ethereum';
import {configureChains, createConfig, useNetwork, useAccount, useSwitchNetwork} from 'wagmi';
import {getPublicClient, getWalletClient} from '@wagmi/core';
import {polygon} from 'wagmi/chains';
import {Web3Button} from '@web3modal/react';
import {WALLET_CONNECT, POLYGON_NETWORK} from '@space/hooks/api';
import styles from './wallet.module.scss';

export {polygon as polygonChain} from 'wagmi/chains';
export {WALLET_CONNECT} from '@space/hooks/api';
export {WagmiConfig} from 'wagmi';
export {Web3Modal} from '@web3modal/react';
export const chains = [polygon];

const {publicClient} = configureChains(chains, [w3mProvider({projectId: WALLET_CONNECT})]);
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({projectId: WALLET_CONNECT, chains}),
  publicClient,
});
export const ethereumClient = new EthereumClient(wagmiConfig, chains);

export const useConnector = () => {
  const [prevStatus, setPrevStatus] = useState('');
  const {address, status} = useAccount();
  const {chain} = useNetwork();
  const [ethereum, setEthereum] = useState<any>();
  const [wallet, setWallet] = useState<any>();

  useEffect(() => {
    getWalletClient({chainId: chain?.id}).then(setWallet);
  }, [status, chain]);

  useEffect(() => {
    if (prevStatus === 'connected' && status === 'disconnected') {
      location.reload();
    } else {
      setPrevStatus(status);
    }
  }, [setPrevStatus, prevStatus, status]);

  useEffect(() => {
    setEthereum((window as any)?.ethereum);
  }, []);

  return {
    account: address as string,
    chainId: chain?.id,
    status,
    ethereum,
    provider: getPublicClient({chainId: chain?.id}),
    wallet,
  };
};

export const Connect = () => (
  <div className={styles.connect}>
    <Web3Button label="Підключи" />
  </div>
);

export const Switch = ({children}: any) => {
  const {switchNetwork} = useSwitchNetwork();
  return <a onClick={() => switchNetwork?.(POLYGON_NETWORK)}>{children}</a>;
};
