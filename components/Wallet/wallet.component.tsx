import {useCallback, useState, useMemo, useEffect} from 'react';
import classNames from 'classnames';
import {Card, Row, Text, Button, Collapse, Container, Spacer, Badge} from '@nextui-org/react';
import Image from 'next/image';
import {useRouter} from 'next/router';
import {useConnector, Switch} from '@space/components/Wallet';
import {GoVerified, GoChecklist} from 'react-icons/go';
import {IoIosPeople} from 'react-icons/io';
import {BsDatabaseFillAdd, BsDatabaseFillDash} from 'react-icons/bs';
import {MdShoppingCartCheckout} from 'react-icons/md';
import {
  ADDRESS,
  TOKEN_LIST,
  DAO_ADDRESS,
  DAO,
  POLYGON_NETWORK,
  BASE_COM,
  TELEGRAM,
  JAR_CONTRACT,
  USDC_ADDRESS,
  USDT_ADDRESS,
} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {Card as InfoCard} from '@space/components/Card';
import {useDebounce} from '@space/hooks/helpers';
import {QRCode} from './qr.component';
import {MINIMUM} from './constants';
import {useInit, useSign, useValidateCode} from './hooks';
import {getStamp, createCode, sectionConfig} from './helpers';
import {VerificationModal, Address} from './common';
import {Swap} from './swap.component';
import {Token} from './token.component';
import {Jar} from './jar.component';
import {Emission} from './emission.component';
import {Dao} from './dao.component';
import {Actions} from './actions.component';
import styles from './wallet.module.scss';

export const Wallet = () => {
  const MM = useConnector();
  const [hash, setHash] = useState('');
  const [config, setConfig] = useState();
  const [priority, setPriority] = useState(0);
  const [action, setAction] = useState('jar');
  const [balance, setBalance] = useState(0);
  const [matic, setMatic] = useState();
  const [reserve, setReserve] = useState();
  const [amount, setAmount] = useState<number | string>(MINIMUM);
  const [resource, setResource] = useState('');
  const [code, setCode] = useState('');
  const [signature, setSignature] = useState('');
  const [varified, setVerified] = useState(false);
  const [vModal, setVModal] = useState('');
  const stamp = useMemo(() => getStamp(), []);
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const debounceFlipped = useDebounce<boolean>(flipped, 123);
  const [jarAsset, setJarAsset] = useState('USDC');

  const sign = useSign({MM, setSignature});
  const validateCode = useValidateCode({resource, setCode});

  const onAmountChange = useCallback(
    (value: string | number) => {
      setAmount(Math.max(MINIMUM, Math.min(Math.floor(balance), Number(value))));
    },
    [setAmount, balance]
  );

  const reset = useCallback(() => {
    setSignature('');
  }, [setSignature]);

  useInit({resource, setCode, setBalance, setMatic, setReserve, setVerified, MM});

  useEffect(() => {
    try {
      const hash = window?.location?.hash;
      if (hash) {
        const params = hash.substring(1).split(':');
        params[0] && setHash(params[0]);
        params[0] &&
          setTimeout(() => {
            document?.getElementById(params[0])?.scrollIntoView({behavior: 'smooth'});
          }, 1234);
        params[1] && setConfig(sectionConfig({body: params[1]}));
        window.location.hash = '';
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (MM.chainId !== POLYGON_NETWORK) {
    return (
      <Card className={styles.wallet}>
        <Card.Body>
          <Row>
            <Switch>Підключи</Switch>&nbsp;Polygon
            <Image src="/polygon.ico" width="24" height="24" alt="Polygon" title="Polygon" />
          </Row>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Container className={styles.container}>
      <InfoCard
        className={styles.card}
        {...{flipped, setFlipped}}
        info={
          <div>
            <div className={styles.name}>
              <Image src="/polygon.ico" width="15" height="15" alt="Polygon" title="Polygon" />{' '}
              Адреса ключа:
            </div>
            <Row align="center" className={styles.address}>
              <Text
                className="private"
                css={{
                  textGradient: '45deg, $blue600 10%, $yellow600 90%',
                }}
              >
                {MM.account}
              </Text>
              {varified ? (
                <GoVerified title="Верифіковано" color="green" className={styles.ml05} />
              ) : (
                <GoVerified
                  color="gray"
                  className={classNames(styles.ml05, styles.pointer)}
                  title="Запит на верифікацію"
                  onClick={() => {
                    // eslint-disable-next-line
                    useSign({
                      MM,
                      setSignature: (signature: string) => {
                        const code = createCode({
                          priority: 0,
                          stamp,
                          type: 'v',
                          source: 'KYC',
                          value: 'true',
                          account: MM.account,
                          signature,
                        });
                        setVModal(code);
                      },
                    })(
                      createCode({
                        priority: 0,
                        stamp,
                        type: 'v',
                        source: 'KYC',
                        value: 'true',
                        account: MM.account,
                        encode: false,
                      })
                    );
                  }}
                />
              )}
              <VerificationModal {...{vModal, setVModal}} />
            </Row>
          </div>
        }
        data={
          <Row justify="space-between" align="center" wrap="wrap">
            <div className={styles.name}>
              Баланс:
              <Text
                css={{
                  fontWeight: 'bold',
                }}
              >
                {balance ?? '-'}
              </Text>
            </div>
            {matic !== undefined ? (
              <div>
                <Text
                  color={matic > 0 ? 'success' : 'error'}
                  small
                  title="Додати POL для операцій"
                  className={classNames(styles.pointer, styles.mr1)}
                  onClick={e => {
                    e?.preventDefault();
                    e?.stopPropagation();
                    window.open('https://wallet.polygon.technology/polygon/gas-swap', '_blank');
                  }}
                >
                  ⛽ газ: {matic} +
                </Text>
              </div>
            ) : null}
          </Row>
        }
        qr={
          <QRCode
            value={MM.account}
            title="QR код"
            bgColor="grey"
            size={50}
            onClick={() => router.push(`/?action=qr`)}
          />
        }
      />

      <Card className={styles.wallet}>
        <Row justify="center" align="center">
          {debounceFlipped ? (
            <>
              <Button
                auto
                flat
                color="success"
                css={{color: 'white'}}
                icon={<Text size={21}>💸</Text>}
                onClick={() => window.open(`${BASE_COM}/?q=кешбек`, '_blank')}
              >
                Кешбек
              </Button>
              <Spacer />
              <Button
                auto
                flat
                css={{color: 'white'}}
                icon={<Text size={21}>🤖</Text>}
                onClick={() => window.open(`${TELEGRAM}`, '_blank')}
              >
                Запит
              </Button>
            </>
          ) : (
            <>
              <Button
                auto
                flat
                color="success"
                css={{color: 'white'}}
                icon={<BsDatabaseFillAdd color="green" size={24} />}
                onClick={() => window.open(`${BASE_COM}/vouchers?tab=add`, '_blank')}
              >
                Поповнити
              </Button>
              <Spacer />
              <Button
                auto
                flat
                css={{color: 'white'}}
                icon={<BsDatabaseFillDash color="red" size={24} />}
                onClick={() => router.push(`/?action=transfer`)}
              >
                Переказати
              </Button>
              <a
                title="Маркетплейс"
                className={styles.ml05}
                style={{color: 'white'}}
                href={BASE_COM}
                target="_blank"
                rel="noreferrer"
              >
                <MdShoppingCartCheckout size={23} />
              </a>
            </>
          )}
        </Row>
        <Collapse.Group accordion={false}>
          <Collapse
            expanded={!hash}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div className={styles.name}>
                  <Image src="/favicon.ico" width="16" height="16" alt="токен" /> Токен:
                </div>
                <div>
                  <Button
                    className={styles.listItem}
                    size="sm"
                    auto
                    light
                    title="Токен List"
                    onClick={() => {
                      window.open(`https://tokenlists.org/token-list?url=${TOKEN_LIST}`, '_blank');
                    }}
                  >
                    <GoChecklist color="green" />
                    &nbsp;
                    <Text small color="grey">
                      список
                    </Text>
                  </Button>
                  <Button
                    className={styles.listItem}
                    size="sm"
                    auto
                    light
                    title="Multi-Chain міст"
                    onClick={() => {
                      window.open(
                        `https://uaht.com.ua/offers/0xD0920a91B0d382C1B0e83DB36178f808AF881121/3`,
                        '_blank'
                      );
                    }}
                  >
                    🌀&nbsp;
                    <Text small color="grey">
                      кросчейн
                    </Text>
                  </Button>
                </div>
              </Row>
            }
            subtitle={
              <div className={styles.address}>
                <Text
                  css={{
                    textGradient: '45deg, $yellow600 10%, $blue600 50%',
                  }}
                >
                  {ADDRESS}
                  <span className={styles.pl05} onClick={e => e?.stopPropagation?.()}>
                    <Address account={ADDRESS} name=" " />
                  </span>
                </Text>
              </div>
            }
          >
            <Token />
          </Collapse>
          <Collapse
            id="swap"
            expanded={hash.startsWith('swap')}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div className={styles.name}>💰 Обмін:</div>
                <div>
                  <Row justify="flex-end" align="center" css={{gap: '0.1rem'}}>
                    <Button
                      size="sm"
                      auto
                      css={{color: 'white', mr: '1rem'}}
                      bordered
                      color="success"
                      title="UAHT Трейдинг"
                      onClick={() => {
                        window.open(`/trade`, '_blank');
                      }}
                    >
                      📊 Трейд
                    </Button>
                  </Row>
                </div>
              </Row>
            }
            subtitle={
              <Row className={styles.address}>
                {['POL', 'USDT', 'USDC', 'ETH', 'BTC'].map(pair => (
                  <Text
                    key={pair}
                    className={styles.pl05}
                    css={{
                      textGradient: '45deg, $red600 25%, $green600 75%',
                    }}
                  >
                    {pair}
                  </Text>
                ))}
              </Row>
            }
          >
            <Swap {...{balance, gas: matic}} />
          </Collapse>
          <Collapse
            id="jar"
            expanded={hash.startsWith('jar')}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div>
                  🫙{' '}
                  <Badge
                    placement="top-right"
                    size="xs"
                    content="UAHT"
                    variant="flat"
                    color="success"
                    verticalOffset="-21%"
                  >
                    Банка
                  </Badge>
                  :{' '}
                  <Button.Group size="sm" onClick={e => e?.stopPropagation?.()}>
                    <Button
                      css={{background: jarAsset === 'USDC' ? '$primary' : '$gray300'}}
                      onClick={() => setJarAsset('USDC')}
                    >
                      USDC
                    </Button>
                    <Button
                      css={{background: jarAsset === 'USDT' ? '$primary' : '$gray300'}}
                      onClick={() => setJarAsset('USDT')}
                    >
                      USDT
                    </Button>
                  </Button.Group>
                </div>
                <div>
                  <Row justify="flex-end" align="center">
                    <Button
                      bordered
                      color="gradient"
                      size="sm"
                      auto
                      css={{color: 'white', mr: '1rem'}}
                      title="Позиції"
                      onClick={() => {
                        window.open(
                          `https://app.aave.com/reserve-overview/?underlyingAsset=${
                            jarAsset === 'USDC' ? USDC_ADDRESS : USDT_ADDRESS
                          }&marketName=proto_polygon_v3`,
                          '_blank'
                        );
                      }}
                    >
                      AAVE
                    </Button>
                  </Row>
                </div>
              </Row>
            }
            subtitle={
              JAR_CONTRACT ? (
                <Row className={styles.address}>
                  <Text
                    css={{
                      textGradient: '45deg, white 10%, $blue600 90%',
                      '@smMax': {
                        display: 'none',
                      },
                    }}
                  >
                    {JAR_CONTRACT}
                  </Text>
                  <Text
                    css={{
                      textGradient: '45deg, white 10%, $blue600 90%',
                      '@smMin': {
                        display: 'none',
                      },
                    }}
                  >
                    <Address account={JAR_CONTRACT} />
                  </Text>
                  <Info
                    className={classNames(styles.pl05)}
                    link={`https://polygonscan.com/address/${JAR_CONTRACT}`}
                    icon="↗"
                  />
                </Row>
              ) : null
            }
          >
            {JAR_CONTRACT ? (
              <Jar jarAsset={jarAsset} />
            ) : (
              <Text i color="grey">
                немає відкритих позицій
              </Text>
            )}
          </Collapse>
          <Collapse
            id="dao"
            css={{borderBottom: 0}}
            expanded={hash.startsWith('dao')}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div className={styles.name}>✨ DAO:</div>
                <div>
                  <Row justify="flex-end" align="center">
                    <Info
                      className={classNames(styles.partner, styles.pr1)}
                      icon={
                        <Row align="center">
                          <IoIosPeople size={18} />
                          &nbsp;
                          <Text small color="grey">
                            спільнота
                          </Text>
                        </Row>
                      }
                      text={
                        <>
                          З приводу партнерства 🤝 звертайся до спільноти{' '}
                          <a href={DAO} target="_blank" rel="noreferrer">
                            @uaht_group
                          </a>
                        </>
                      }
                    />
                  </Row>
                </div>
              </Row>
            }
            subtitle={
              <Row className={styles.address}>
                <Text
                  css={{
                    textGradient: '45deg, grey 10%, white 90%',
                  }}
                >
                  {DAO_ADDRESS}
                </Text>
                <Info
                  className={classNames(styles.pl05)}
                  link={`https://polygonscan.com/address/${DAO_ADDRESS}#readContract`}
                  icon="↗"
                />
              </Row>
            }
          >
            <Dao config={config} />
          </Collapse>
          <Emission />
        </Collapse.Group>
        <Actions />
      </Card>
    </Container>
  );
};
