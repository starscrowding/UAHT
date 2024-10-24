import {useEffect, useCallback, useMemo} from 'react';
import {formatEther, formatUnits} from 'viem';
import ERC20_ABI from '@space/contracts/ERC20.abi.json';
import UAHT_ABI from '@space/contracts/UAHT.abi.json';
import UAHT_DAO_ABI from '@space/contracts/UAHT_DAO.abi.json';
import UAHT_CHCKOUT_ABI from '@space/contracts/UAHT_CHECKOUT.abi.json';
import {Address as AddressType} from 'viem';
import {useUahtApprove, useUahtBalanceOf, useUahtTransfer} from '@uaht/sdk';
import {api, ADDRESS, DAO_ADDRESS, CHECKOUT_ADDRESS, RESERVE} from '@space/hooks/api';
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
  const {data: balance} = useUahtBalanceOf({
    args: [MM.account as AddressType],
    watch: true,
  });

  useEffect(() => {
    setCode('');
  }, [resource, setCode]);

  useEffect(() => {
    if (balance) {
      setBalance(formatUnits(balance as bigint, 2));
    }
  }, [balance, setBalance]);

  useEffect(() => {
    const balanceOf = async () => {
      try {
        const web3Provider = MM.provider;
        const [balance, gas] = await Promise.all([
          uaht.balanceOf(MM.account),
          web3Provider.getBalance({address: MM.account}),
        ]);
        setMatic(precision(formatEther(gas), 3));
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
  }, [MM.account, MM.provider, setReserve, setVerified, setMatic, uaht]);
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
    const signer = MM.wallet;
    const signedMessage = await signer?.signMessage({
      account: MM.account,
      message: msg,
    });
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
  const config = {
    address: ADDRESS,
    abi: UAHT_ABI,
  };
  const {writeAsync: transfer} = useUahtTransfer();
  const {writeAsync: approve} = useUahtApprove();

  return useMemo(() => {
    return {
      balanceOf: async (address: string) =>
        await MM.provider.readContract({
          ...config,
          functionName: 'balanceOf',
          args: [address],
        } as any),
      transfer: async (to: string, amount: number) =>
        await transfer({
          args: [to as AddressType, BigInt(amount)],
        }),
      approve: async (spender: string, amount: number) =>
        await approve({
          args: [spender as AddressType, BigInt(amount)],
        } as any),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MM.provider, MM.wallet]);
};

export const useUahtDao = () => {
  const MM = useConnector();
  const config = {
    address: DAO_ADDRESS,
    abi: UAHT_DAO_ABI,
  };

  return useMemo(() => {
    return {
      allowance: async (address: string) =>
        await MM.provider.readContract({
          ...config,
          functionName: 'allowance',
          args: [address],
        } as any),
      operators: async (address: string) =>
        await MM.provider.readContract({
          ...config,
          functionName: 'allowance',
          args: [address],
        } as any),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MM.provider, MM.wallet]);
};

export const useUahtCheckout = () => {
  const MM = useConnector();
  const config = {
    address: CHECKOUT_ADDRESS,
    abi: UAHT_CHCKOUT_ABI,
  };

  return useMemo(() => {
    return {
      transfer: async (to: string, msg: string, amount: number) =>
        await MM.wallet.writeContract({
          ...config,
          functionName: 'order',
          args: [to, msg, amount],
        } as any),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MM.provider, MM.wallet]);
};

export const useERC20 = (contract: string) => {
  const MM = useConnector();
  const config = {
    address: contract,
    abi: ERC20_ABI,
  };

  return useMemo(() => {
    return {
      transfer: async (to: string, amount: number) =>
        await MM.wallet.writeContract({
          ...config,
          functionName: 'transfer',
          args: [to, amount],
        } as any),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MM.provider, MM.wallet, contract]);
};
