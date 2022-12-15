import {useEffect, useState} from 'react';
import {configureChains, createClient, useNetwork, useAccount, useProvider, useSigner} from 'wagmi';
import {polygon} from 'wagmi/chains';
import {EthereumClient, modalConnectors, walletConnectProvider} from '@web3modal/ethereum';
import {Web3Button} from '@web3modal/react';
import {WALLET_CONNECT} from '@space/hooks/api';
import styles from './wallet.module.scss';

export {WALLET_CONNECT} from '@space/hooks/api';
export {WagmiConfig} from 'wagmi';
export {Web3Modal} from '@web3modal/react';
export const chains = [polygon];

export const {provider} = configureChains(chains, [
  walletConnectProvider({projectId: WALLET_CONNECT}),
]);
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({appName: 'web3Modal', chains}),
  provider,
});
export const ethereumClient = new EthereumClient(wagmiClient, chains);

export const useConnector = () => {
  const {address, status} = useAccount();
  const {chain} = useNetwork();
  const provider = useProvider();
  const {data: signer} = useSigner();
  const [ethereum, setEthereum] = useState<any>();

  useEffect(() => {
    setEthereum(window.ethereum);
  }, []);

  return {
    account: address as string,
    chainId: chain?.id,
    status,
    provider,
    signer,
    ethereum,
  };
};

export const Connect = () => (
  <div className={styles.connect}>
    <Web3Button label="Підключи" />
  </div>
);
