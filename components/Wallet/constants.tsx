export const MINIMUM = 100;
export const MIN_CODE_LENGTH = 16;
export const RESOURCES: {[key: string]: {text: string; help: string; validator: RegExp}} = {
  binance: {
    text: 'Binance',
    help: 'https://www.binance.com/uk-UA/gift-card/transfer?ref=CPA_003FR4HL2E',
    validator: /^[A-Z0-9]+$/,
  },
  whitebit: {
    text: 'WhiteBit',
    help: 'https://whitebit.com/ua/codes/create?referral=1f23f645-c9bb-46e4-af38-fa80d33b3215',
    validator: /^WB.+UAH$/,
  },
  kuna: {
    text: 'Kuna',
    help: 'https://kuna.io/kuna-code/uk?r=kunaid-i50d4fvk13eb',
    validator: /^.+UAH-KCode$/,
  },
};
export const PROVIDERS: {
  [key: string]: {text: string; help: string; id: string; validator: RegExp};
} = {
  geopay: {
    text: 'GEO Pay',
    help: 'https://geo-pay.net/',
    id: 'bf43e1c8e907ea295c858f042f02411d2279f085b829bdda5ea23596801804d1',
    validator: {test: v => v?.length > 60} as RegExp,
  },
  settlepay: {
    text: 'SettlePay',
    help: 'https://settlepay.net/ua/',
    id: 'SP53950543598bc',
    validator: /^SP.+$/,
  },
  advcash: {
    text: 'Advcash',
    help: 'https://wallet.advcash.com:443/referral/49cff02e-b8bb-42b0-8f09-97f82838b1c7',
    id: 'H892086463650',
    validator: /^H.+$/,
  },
};
