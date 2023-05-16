import {useCallback, useState, useMemo, useEffect} from 'react';
import classNames from 'classnames';
import {Card, Row, Text, Button, Collapse, Container} from '@nextui-org/react';
import Image from 'next/image';
import {useConnector, Switch} from '@space/components/Wallet';
import {GoVerified, GoChecklist, GoDatabase} from 'react-icons/go';
import {ADDRESS, TOKEN_LIST, DAO_ADDRESS, DAO, POLYGON_NETWORK} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {Card as InfoCard} from '@space/components/Card';
import {MINIMUM} from './constants';
import {useInit, useSign, useValidateCode} from './hooks';
import {getStamp, createCode, sectionConfig} from './helpers';
import {VerificationModal, Address} from './common';
import {Ex} from './ex.component';
import {Trade} from './trade.component';
import {Token} from './token.component';
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
        info={
          <div>
            <div className={styles.name}>
              <Image src="/polygon.ico" width="15" height="15" alt="Polygon" title="Polygon" />{' '}
              Адреса ключа:
            </div>
            <Row align="center" className={styles.address}>
              <Text
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
                  title="Додати MATIC для операцій"
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
      />

      <Card className={styles.wallet}>
        <Collapse.Group accordion={false}>
          <Collapse
            expanded={false}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div className={styles.name}>
                  <GoDatabase color="green" /> Поповнити:
                </div>
                <div>
                  <Row justify="flex-end" align="center">
                    <Text small color="grey">
                      🫙 банка спільноти
                    </Text>
                    <Info
                      className={classNames(styles.partner, styles.pl05, styles.pr1)}
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
          >
            <Ex
              {...{
                action,
                balance,
                resource,
                setResource,
                reserve,
                MM,
                signature,
                code,
                validateCode,
                amount,
                setAmount,
                onAmountChange,
                priority,
                setPriority,
                stamp,
                sign,
              }}
            />
          </Collapse>
          <Collapse
            expanded={!hash}
            title={
              <Row justify="space-between" align="center" wrap="wrap">
                <div className={styles.name}>
                  <Image src="/favicon-16x16.png" width="16" height="16" alt="токен" /> Адреса
                  токена:
                </div>
                <div>
                  <Button
                    className={styles.button}
                    size="sm"
                    auto
                    light
                    title="Токен List"
                    onClick={() => {
                      window.open(`https://tokenlists.org/token-list?url=${TOKEN_LIST}`, '_blank');
                    }}
                  >
                    <GoChecklist color="green" />
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
            expanded={false}
            title={<div className={styles.name}>💰 Обмін:</div>}
            subtitle={
              <Row className={styles.address}>
                {['MATIC', 'USDT', 'BTC', 'ETH', 'UAH'].map(pair => (
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
            <Trade {...{balance, gas: matic}} />
          </Collapse>
          <Collapse
            id="dao"
            expanded={hash.startsWith('dao')}
            title={<div className={styles.name}>✨ Спільнота DAO:</div>}
            subtitle={
              <div className={styles.address}>
                <Text
                  css={{
                    textGradient: '45deg, grey 10%, white 50%',
                  }}
                >
                  {DAO_ADDRESS}
                </Text>
              </div>
            }
          >
            <Dao config={config} />
          </Collapse>
        </Collapse.Group>
        <Actions />
      </Card>
    </Container>
  );
};
