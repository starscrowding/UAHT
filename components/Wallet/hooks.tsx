import {useEffect, useCallback, useMemo} from 'react';
import {ethers} from 'ethers';
import ERC20_ABI from '@space/contracts/ERC20.abi.json';
import UAHT_ABI from '@space/contracts/UAHT.abi.json';
import UAHT_DAO_ABI from '@space/contracts/UAHT_DAO.abi.json';
import {api, ADDRESS, DAO_ADDRESS, RESERVE, USDT_ADDRESS} from '@space/hooks/api';
import {useConnector} from '@space/components/Wallet';
import {precision} from './helpers';
import {RESOURCES, MIN_CODE_LENGTH} from './constants';

export const useInit = ({
  resource,
  setCode,
  setBalance,
  setMatic,
  setReserve,
  setVerified,
  MM,
}: any) => {
  const uaht = useUaht();

  useEffect(() => {
    setCode('');
  }, [resource, setCode]);

  useEffect(() => {
    const balanceOf = async () => {
      try {
        const web3Provider = MM.provider;
        const [balance, gas] = await Promise.all([
          uaht.balanceOf(MM.account),
          web3Provider.getBalance(MM.account),
        ]);
        setBalance(ethers.utils.formatUnits(balance, 2));
        setMatic(precision(ethers.utils.formatEther(gas), 3));
      } catch (e) {
        console.log(e);
      }
    };
    const reserveOf = async () => {
      try {
        const row = await api(RESERVE);
        const io = row?.files?.['uaht.io']?.content
          ?.split('\n')
          ?.reduce((acc: {[key: string]: string}, v: string) => {
            const split = v.split('=');
            acc[split[0]] = split[1];
            return acc;
          }, {});
        const verified = new RegExp(MM.account, 'mig').test(row?.files?.['x.DAO']?.content);
        setReserve(io);
        setVerified(verified);
      } catch (e) {
        console.log(e);
      }
    };
    Promise.allSettled([balanceOf(), reserveOf()]);
  }, [MM.account, MM.provider, setBalance, setReserve, setVerified, setMatic, uaht]);
};

export const useAddToken = ({MM}: any) => async () => {
  if (MM.ethereum) {
    try {
      await MM.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: ADDRESS,
            symbol: 'UAHT',
            decimals: 2,
            image: 'https://uaht.io/icon.png',
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  }
};

export const useSign = ({MM, setSignature}: any) => async (msg: string) => {
  try {
    const signer = MM.signer;
    const signedMessage = await signer.signMessage(msg);
    setSignature(signedMessage);
  } catch (e) {
    console.log(e);
  }
};

export const useValidateCode = ({resource, setCode}: any) =>
  useCallback(
    (value: string) => {
      try {
        if (value?.length >= MIN_CODE_LENGTH && RESOURCES[resource].validator.test(value)) {
          btoa(value);
          setCode(value.replace(/ /g, ''));
        } else {
          setCode('');
        }
      } catch (e) {
        setCode('');
      }
    },
    [setCode, resource]
  );

export const useUaht = () => {
  const MM = useConnector();
  return useMemo(() => {
    const web3Provider = MM.provider;
    const signer = MM.signer || web3Provider;
    return new ethers.Contract(ADDRESS, UAHT_ABI, signer);
  }, [MM.provider, MM.signer]);
};

export const useUahtDao = () => {
  const MM = useConnector();
  return useMemo(() => {
    const web3Provider = MM.provider;
    const signer = MM.signer || web3Provider;
    return new ethers.Contract(DAO_ADDRESS, UAHT_DAO_ABI, signer);
  }, [MM.provider, MM.signer]);
};

export const useERC20 = (address: string) => {
  const MM = useConnector();
  return useMemo(() => {
    const web3Provider = MM.provider;
    const signer = MM.signer || web3Provider;
    return new ethers.Contract(address, ERC20_ABI, signer);
  }, [MM.provider, MM.signer, address]);
};
