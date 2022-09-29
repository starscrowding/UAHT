import {useEffect, useCallback} from 'react';
import {ethers} from 'ethers';
import UAHT_ABI from '@space/contracts/UAHT.abi.json';
import {api, ADDRESS, RESERVE} from '@space/hooks/api';
import {precision} from './helpers';
import {PROVIDERS, RESOURCES, MIN_CODE_LENGTH} from './constants';

export const useInit = ({
  resource,
  setCode,
  setId,
  provider,
  setBalance,
  setMatic,
  setReserve,
  MM,
}: any) => {
  useEffect(() => {
    setCode('');
  }, [resource, setCode]);

  useEffect(() => {
    setId('');
  }, [provider, setId]);

  useEffect(() => {
    const balanceOf = async () => {
      const web3Provider = new ethers.providers.Web3Provider(MM.ethereum);
      const uaht = new ethers.Contract(ADDRESS, UAHT_ABI, web3Provider);
      try {
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
        setReserve(io);
      } catch (e) {
        console.log(e);
      }
    };
    balanceOf();
    reserveOf();
  }, [MM, setBalance, setReserve]);
};

export const useAddToken = ({MM}: any) => async () => {
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
};

export const useSign = ({MM, setSignature}: any) => async (msg: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(MM.ethereum);
    const signer = provider.getSigner();
    const signedMessage = await signer.signMessage(msg);
    setSignature(signedMessage);
  } catch (e) {
    console.log(e);
  }
};

export const useValidateCode = ({resource, setCode}: any) =>
  useCallback(
    value => {
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

export const useValidateId = ({provider, setId}: any) =>
  useCallback(
    value => {
      if (value && PROVIDERS[provider].validator.test(value)) {
        setId(value.replace(/ /g, ''));
      } else {
        setId('');
      }
    },
    [setId, provider]
  );
