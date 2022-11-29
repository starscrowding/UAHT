import {ethers} from 'ethers';

export const precision = (number: string | number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(Number(number) * factor) / factor;
};

export const getStamp = () => {
  return Date.now().toString();
};

export const createCode = ({
  priority = 0,
  stamp,
  type,
  source,
  value,
  account,
  payload,
  signature,
  encode = true,
}: {
  priority: number;
  stamp: string;
  type: string;
  source: string;
  value: string;
  account: string;
  payload?: string;
  signature?: string;
  encode?: boolean;
}) => {
  const params = [priority, stamp, type, source, value, account?.toLowerCase()];
  if (payload) {
    params.push(payload);
  }
  const code = params.join(':');
  if (encode) {
    try {
      return btoa(code).concat(signature ? `.${signature}` : '');
    } catch {
      return '';
    }
  }
  return code;
};

export const parseCode = (code: string = '') => {
  try {
    const body = atob(code.split('.')[0]);
    const signature = code.split('.')[1];
    const [priority, stamp, type, source, value, account, payload] = body.split(':');
    return {
      priority,
      stamp,
      type,
      source,
      value,
      account,
      payload,
      body,
      signature,
    };
  } catch {
    return {
      error: 'Invalid code',
    };
  }
};

export const validateSignature = async ({trx, setValid, account = trx.account}: any) => {
  try {
    if (trx.body && trx.signature) {
      const signer = await ethers.utils.verifyMessage(trx.body, trx.signature);
      if (account && signer) {
        setValid(account.toLowerCase() === signer.toLowerCase());
      }
    }
  } catch (e) {
    console.log(e);
  }
};
