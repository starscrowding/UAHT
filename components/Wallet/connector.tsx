import {useMetaMask} from 'metamask-react';

export interface IConnector {
  account: string;
  chainId: string;
  status: string;
  connect: () => Promise<string[] | null>;
  addChain: (parameters: any) => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  ethereum: any;
}

// todo: use WalletConnect
export const useConnector = () => {
  return useMetaMask() as IConnector;
};
