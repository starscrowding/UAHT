export const BASE = 'https://uaht.io';
export const CONTRACT =
  'https://polygonscan.com/token/0x0d9447e16072b636b4a1e8f2b8c644e58f3eaa6a#writeContract';
export const ENDPOINT = {
  token: {
    set: '/api/token/set',
  },
};

export const api = async (url: RequestInfo, params?: RequestInit) => {
  return fetch(url, params).then(res => res.json());
};

export const post = async (url: RequestInfo, body: any, params?: RequestInit) => {
  return await api(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...params,
  });
};

export const fetcher = (...args: any) => api.apply(null, args);
