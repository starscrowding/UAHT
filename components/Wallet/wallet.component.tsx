import {useCallback, useState, useMemo} from 'react';
import {Card, Row, Text, Button, Collapse, Switch} from '@nextui-org/react';
import {useConnectedMetaMask} from 'metamask-react';
import classNames from 'classnames';
import {GoVerified} from 'react-icons/go';
import {ADDRESS, DAO, TOKEN_LIST} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {POLYGON_ID} from '../Metamask';
import {MINIMUM} from './constants';
import {useInit, useAddToken, useSign, useValidateCode, useValidateId} from './hooks';
import {getStamp, createCode} from './helpers';
import {Empty, VerificationModal} from './common';
import {Fiat} from './fiat.component';
import {Ex} from './ex.component';
import styles from './wallet.module.scss';

export const Wallet = () => {
  const MM = useConnectedMetaMask();
  const [priority] = useState(0);
  const [action, setAction] = useState('input');
  const [balance, setBalance] = useState(0);
  const [matic, setMatic] = useState();
  const [reserve, setReserve] = useState();
  const [amount, setAmount] = useState<number | string>(MINIMUM);
  const [resource, setResource] = useState('');
  const [provider, setProvider] = useState('');
  const [code, setCode] = useState('');
  const [signature, setSignature] = useState('');
  const [fiat, setFiat] = useState(false);
  const [id, setId] = useState('');
  const [varified, setVerified] = useState(false);
  const [vModal, setVModal] = useState('');
  const stamp = useMemo(() => getStamp(), []);

  const addToken = useAddToken({MM});
  const sign = useSign({MM, setSignature});
  const validateCode = useValidateCode({resource, setCode});
  const validateId = useValidateId({provider, setId});

  const onAmountChange = useCallback(
    value => {
      setAmount(Math.max(MINIMUM, Math.min(Number(balance), Number(value))));
    },
    [setAmount, balance]
  );

  const reset = useCallback(() => {
    setSignature('');
  }, [setSignature]);

  useInit({resource, setCode, setId, provider, setBalance, setMatic, setReserve, setVerified, MM});

  if (MM.chainId !== POLYGON_ID) {
    return <Empty {...{MM}} />;
  }

  return (
    <Card className={styles.wallet}>
      <Collapse.Group accordion={false}>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <div className={styles.name}>Гаманець:</div>
          <Row align="center" className={styles.address}>
            <Text>{MM.account}</Text>
            {varified ? (
              <GoVerified title="Веріфіковано" color="green" className={styles.ml05} />
            ) : (
              <GoVerified
                color="gray"
                className={classNames(styles.ml05, styles.pointer)}
                title="Запит на веріфікацію"
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
                      window.open('https://wallet.polygon.technology/gas-swap/', '_blank');
                    }}
                  >
                    газ: {matic} +
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
            <Button.Group color="gradient" ghost>
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
                партнерський пул:
                <select className={styles.partner} name="partner">
                  {['freelook'].map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
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
          <Row className={styles.mv1} justify="flex-start" align="center" wrap="wrap">
            <a onClick={() => setFiat(false)} className={classNames({[styles.underline]: !fiat})}>
              Біржа
            </a>
            <Switch
              className={styles.switch}
              checked={fiat}
              onChange={() => {
                reset();
                setFiat(!fiat);
              }}
              icon={<>₴</>}
            />
            <a onClick={() => setFiat(true)} className={classNames({[styles.underline]: fiat})}>
              Фіат
            </a>
          </Row>
          {fiat ? (
            <Fiat
              {...{
                action,
                balance,
                provider,
                setProvider,
                reserve,
                MM,
                signature,
                id,
                validateId,
                amount,
                setAmount,
                onAmountChange,
                priority,
                stamp,
                sign,
              }}
            />
          ) : (
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
                stamp,
                sign,
              }}
            />
          )}
        </Collapse>
        <Collapse
          expanded={true}
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
              auto
              onClick={() => {
                window.open(`https://tokenlists.org/token-list?url=${TOKEN_LIST}`, '_blank');
              }}
            >
              Токен List
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
