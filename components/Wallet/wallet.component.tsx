import {useCallback, useEffect, useState, useMemo} from 'react';
import {Card, Row, Text, Button, Collapse, Input, Radio, Popover} from '@nextui-org/react';
import Link from 'next/link';
import {useConnectedMetaMask} from 'metamask-react';
import {ethers} from 'ethers';
import {FaTelegramPlane, FaInfoCircle} from 'react-icons/fa';
import classNames from 'classnames';
import UAHT_ABI from '@space/contracts/UAHT.abi.json';
import {ADDRESS, TELEGRAM} from '@space/hooks/api';
import {POLYGON_ID, POLYGON, Address} from '../Metamask';
import styles from './wallet.module.scss';

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

export const Info = ({
  text,
  link,
  className,
}: {
  text?: string;
  link?: string;
  className?: string;
}) => {
  return text ? (
    <Popover placement="top">
      <Popover.Trigger>
        <div className={className}>
          <FaInfoCircle color="white" />
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <Text css={{p: '$10'}}>{text}</Text>
      </Popover.Content>
    </Popover>
  ) : link ? (
    <Link href={link}>
      <a className={className} target="_blank">
        <FaInfoCircle color="white" />
      </a>
    </Link>
  ) : null;
};

export const RequestButton = ({disabled}: {disabled?: boolean}) => (
  <Button
    size="sm"
    disabled={disabled}
    icon={<FaTelegramPlane size="21" />}
    onClick={() => {
      window.open(TELEGRAM, '_blank');
    }}
  >
    Запит {!disabled ? <span className={styles.ml1}>👉</span> : null}
  </Button>
);

export const getStamp = () => {
  return Date.now().toString();
};

export const createCode = ({
  priority = 0,
  stamp,
  type,
  resource,
  value,
  account,
  signature,
  encode = true,
}: {
  priority: number;
  stamp: string;
  type: string;
  resource: string;
  value: string;
  account: string;
  signature?: string;
  encode?: boolean;
}) => {
  const params = [priority, stamp, type, resource, value, account?.toLowerCase()];
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

export const Wallet = () => {
  const MM = useConnectedMetaMask();
  const [priority] = useState(0);
  const [action, setAction] = useState('input');
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState<number | string>('');
  const [resource, setResource] = useState('');
  const [code, setCode] = useState('');
  const [signature, setSignature] = useState('');

  const stamp = useMemo(() => getStamp(), []);

  const addToken = async () => {
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

  const sign = async (msg: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(MM.ethereum);
      const signer = provider.getSigner();
      const signedMessage = await signer.signMessage(msg);
      setSignature(signedMessage);
    } catch (e) {
      console.log(e);
    }
  };

  const onAmountChange = useCallback(
    value => {
      setAmount(Math.max(MINIMUM, Math.min(Number(balance), Number(value))) || '');
    },
    [setAmount, balance]
  );

  const validateCode = useCallback(
    value => {
      try {
        if (value?.length >= MIN_CODE_LENGTH && RESOURCES[resource].validator.test(value)) {
          btoa(value);
          setCode(value);
        } else {
          setCode('');
        }
      } catch (e) {
        setCode('');
      }
    },
    [setCode, resource]
  );

  const reset = useCallback(() => {
    setSignature('');
  }, [setSignature]);

  useEffect(() => {
    setCode('');
  }, [resource]);

  useEffect(() => {
    const balanceOf = async () => {
      const provider = new ethers.providers.Web3Provider(MM.ethereum);
      const uaht = new ethers.Contract(ADDRESS, UAHT_ABI, provider);
      try {
        const balance = await uaht.balanceOf(MM.account);
        setBalance(balance?.toNumber() / 100);
      } catch (e) {
        console.log(e);
      }
    };
    balanceOf();
  }, [MM]);

  if (MM.chainId !== POLYGON_ID) {
    return (
      <Card className={styles.wallet}>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          Для користування треба активація мережі Polygon
        </Row>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <Button className={styles.button} size="sm" auto onClick={() => MM.addChain(POLYGON)}>
            Додати Polygon
          </Button>
        </Row>
      </Card>
    );
  }

  return (
    <Card className={styles.wallet}>
      <Collapse.Group accordion={false}>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <div className={styles.name}>Гаманець:</div>
          <div className={styles.address}>
            <Text>{MM.account}</Text>
          </div>
        </Row>
        <Collapse
          expanded
          title={<div className={styles.name}>Баланс:</div>}
          subtitle={
            <Text
              css={{
                textGradient: '45deg, $yellow600 10%, $blue600 50%',
              }}
            >
              {balance ?? '-'}
            </Text>
          }
        >
          <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
            <Button.Group color="gradient" ghost>
              <Button
                size="sm"
                auto
                onClick={() => {
                  reset();
                  setAction('input');
                }}
                className={classNames({[styles.action]: action === 'input'})}
              >
                Ввід
              </Button>
              <Button
                size="sm"
                auto
                onClick={() => {
                  reset();
                  setAction('output');
                }}
                className={classNames({[styles.action]: action === 'output'})}
              >
                Вивід
              </Button>
            </Button.Group>
          </Row>
          <div>
            <div className={styles.m1}>
              <Radio.Group
                className={styles.radio}
                label="Обери pecypc:"
                orientation="horizontal"
                size="sm"
                onChange={value => setResource(value)}
              >
                {Object.keys(RESOURCES).map((key: string) => (
                  <Radio key={key} value={key}>
                    {RESOURCES[key]?.text}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
            {action === 'input' ? (
              <div>
                <Row className={styles.row} align="center">
                  <Input
                    underlined
                    disabled={!resource}
                    color="secondary"
                    placeholder={`${RESOURCES[resource]?.text || ''} Код UAH`}
                    width="200px"
                    value={code}
                    onChange={e => validateCode(e?.target?.value)}
                  />
                  <Info link={RESOURCES[resource]?.help} className={styles.ml1} />
                </Row>
                <Row align="center">
                  <RequestButton disabled={!resource || !code} />
                  {resource && code ? (
                    <>
                      <Address
                        className={styles.ml1}
                        account={createCode({
                          priority,
                          stamp,
                          type: 'i',
                          resource,
                          value: code,
                          account: MM.account,
                        })}
                      />
                      <Info
                        text="Скопіюй та відправ код запиту для поповнення 🤝"
                        className={styles.ml1}
                      />
                    </>
                  ) : null}
                </Row>
              </div>
            ) : null}
            {action === 'output' ? (
              <div>
                {balance >= MINIMUM ? (
                  <div>
                    <Row className={styles.row}>
                      <Input
                        underlined
                        color="secondary"
                        type="number"
                        placeholder="Сума"
                        width="200px"
                        disabled={!!signature}
                        value={amount as any}
                        onChange={e => {
                          setAmount(e?.target?.value);
                        }}
                        onBlur={() => onAmountChange(amount)}
                      />
                      <Button
                        className={styles.button}
                        size="sm"
                        auto
                        disabled={!amount || !!signature}
                        onClick={() =>
                          sign(
                            createCode({
                              priority,
                              stamp,
                              type: 'o',
                              resource,
                              value: amount?.toString(),
                              account: MM.account,
                              encode: false,
                            })
                          )
                        }
                      >
                        Підписати
                      </Button>
                    </Row>
                    <Row align="center">
                      <RequestButton disabled={!resource || !signature} />
                      {resource && signature ? (
                        <>
                          <Address
                            className={styles.ml1}
                            account={createCode({
                              priority,
                              stamp,
                              type: 'o',
                              resource,
                              value: amount?.toString(),
                              account: MM.account,
                              signature,
                            })}
                          />
                          <Info
                            text="Скопіюй та відправ код запиту для виводу 🤝"
                            className={styles.ml1}
                          />
                        </>
                      ) : null}
                    </Row>
                  </div>
                ) : (
                  <div>Мінімальний вивід {MINIMUM}. Поповни баланс 🤑</div>
                )}
              </div>
            ) : null}
          </div>
        </Collapse>
        <Collapse
          expanded
          title={<div className={styles.name}>Адреса токена:</div>}
          subtitle={
            <div className={styles.address}>
              <Text
                css={{
                  textGradient: '45deg, $yellow600 10%, $blue600 50%',
                }}
              >
                {ADDRESS}
              </Text>
            </div>
          }
        >
          <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
            <Button className={styles.button} size="sm" auto onClick={() => addToken()}>
              Додати в Metamask
            </Button>
            <Button
              className={styles.button}
              size="sm"
              color="gradient"
              auto
              onClick={() => {
                window.open('https://app.uniswap.org/#/swap?chain=polygon', '_blank');
              }}
            >
              Обміняти на Uniswap
            </Button>
          </Row>
        </Collapse>
      </Collapse.Group>
    </Card>
  );
};
