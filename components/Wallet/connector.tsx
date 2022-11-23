import {useConnectedMetaMask} from 'metamask-react';

export const useConnector = () => {
  return useConnectedMetaMask();
};
