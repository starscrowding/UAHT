export const MINIMUM = 200;
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
