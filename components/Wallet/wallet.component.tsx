import {useCallback, useState, useMemo} from 'react';
import classNames from 'classnames';
import {Card, Row, Text, Button, Collapse} from '@nextui-org/react';
import Image from 'next/image';
import {useConnector} from '@space/components/Wallet';
import {GoVerified} from 'react-icons/go';
import {ADDRESS, DAO_ADDRESS, DAO} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {MINIMUM} from './constants';
import {useInit, useSign, useValidateCode} from './hooks';
import {getStamp, createCode} from './helpers';
import {VerificationModal, Address} from './common';
import {Ex} from './ex.component';
import {Trade} from './trade.component';
import {P2P, FIAT} from './p2p.component';
import {Token} from './token.component';
import {Dao} from './dao.component';
import {Actions} from './actions.component';
import styles from './wallet.module.scss';

export const Wallet = () => {
  const MM = useConnector();
  const [priority, setPriority] = useState(0);
  const [action, setAction] = useState('input');
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
    value => {
      setAmount(Math.max(MINIMUM, Math.min(Math.floor(balance), Number(value))));
    },
    [setAmount, balance]
  );

  const reset = useCallback(() => {
    setSignature('');
  }, [setSignature]);

  useInit({resource, setCode, setBalance, setMatic, setReserve, setVerified, MM});

  return (
    <Card className={styles.wallet}>
      <Collapse.Group accordion={false}>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <div className={styles.name}>
            {' '}
            <Image src="/polygon.ico" width="15" height="15" alt="Polygon" title="Polygon" />{' '}
            Гаманець:
          </div>
          <Row align="center" className={styles.address}>
            <Text>{MM.account}</Text>
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
        </Row>
        <Collapse
          expanded={false}
          title={
            <Row justify="space-between" align="center" wrap="wrap">
              <div className={styles.name}>Баланс:</div>
              {matic !== undefined ? (
                <div>
                  <Text
                    color={matic > 0 ? 'success' : 'error'}
                    small
                    title="Додати MATIC для переказів"
                    className={classNames(styles.pointer, styles.mr1)}
                    onClick={e => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      window.open(
                        'https://wallet-beta.polygon.technology/polygon/gas-swap',
                        '_blank'
                      );
                    }}
                  >
                    ⛽ газ: {matic} +
                  </Text>
                </div>
              ) : null}
            </Row>
          }
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
          <Row className={styles.row} justify="space-between" align="center" wrap="wrap">
            <Button.Group color="gradient" ghost key={action}>
              {[
                {name: 'Ввід', act: 'input'},
                {name: 'Вивід', act: 'output'},
              ].map(b => (
                <Button
                  key={b.act}
                  size="sm"
                  auto
                  onClick={() => {
                    reset();
                    setAction(b.act);
                  }}
                  className={classNames({[styles.action]: action === b.act})}
                >
                  {b.name}
                </Button>
              ))}
            </Button.Group>
            <div className={classNames(styles.flex, styles.ac)}>
              <Text small color="grey">
                партнерський пул
              </Text>
              <Info
                className={styles.partner}
                text={
                  <>
                    З приводу партнерства звертайся до спільноти{' '}
                    <a href={DAO} target="_blank" rel="noreferrer">
                      @uaht_group
                    </a>
                  </>
                }
              />
            </div>
          </Row>
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
          expanded={false}
          title={<div className={styles.name}>💳 P2P перекази</div>}
          subtitle={
            <Row className={styles.address}>
              {FIAT.map(p => (
                <Text key={p.name} className={styles.pl05} color={p.color}>
                  {p.name}
                </Text>
              ))}
            </Row>
          }
        >
          <P2P {...{balance, gas: matic}} />
        </Collapse>
        <Collapse
          expanded={false}
          title={<div className={styles.name}>💰 Обмін / Торги</div>}
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
          <Trade />
        </Collapse>
        <Collapse
          expanded={true}
          title={
            <div className={styles.name}>
              <Image src="/icon.png" width="15" height="15" alt="токен" /> Адреса токена:
            </div>
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
          <Dao />
        </Collapse>
      </Collapse.Group>
      <Actions />
    </Card>
  );
};
