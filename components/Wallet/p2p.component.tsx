import {useCallback, useState, useMemo, useEffect} from 'react';
import classNames from 'classnames';
import {IoPerson} from 'react-icons/io5';
import {FaTelegramPlane} from 'react-icons/fa';
import {MdWarning} from 'react-icons/md';
import {Button, Row, Col, Badge, Input, Spacer, Text} from '@nextui-org/react';
import {useConnector} from '@space/components/Wallet';
import {Info} from '@space/components/Info';
import {RequestButton, SignText, Tips, Address} from './common';
import {useSign} from './hooks';
import {getStamp, createCode, parseCode, validateSignature} from './helpers';
import styles from './wallet.module.scss';

export const MIN_GAS = 0.1;
export const MIN_FEE = 20;
export const MIN_AMOUNT = MIN_FEE * 10;
export const MAX_AMOUNT = 25 * 10 ** 3;

export const cardValidator = (c: string) => /^[0-9]+$/.test(c) && c?.length > 13;

export const FIAT = [
  {
    name: 'privat24',
    color: '#75af26',
    help: 'https://privat24.ua/',
    validator: {test: cardValidator} as RegExp,
  },
  {
    name: 'mono',
    color: '#fa5255',
    help: 'https://www.monobank.ua/',
    validator: {test: cardValidator} as RegExp,
  },
  {
    name: 'geopay',
    color: '#d5d6d8',
    help: 'https://geo-pay.net/',
    validator: {test: v => v?.length > 60} as RegExp,
  },
];

export const CHAIN = [{name: 'polygon', color: '#7b3fe5'}];
export const ON_CHAIN = `${CHAIN[0].name}-`;

export const Agent = () => {
  return (
    <Badge
      color="success"
      variant="flat"
      content="%"
      placement="bottom-left"
      horizontalOffset="21%"
    >
      <IoPerson size={30} />
    </Badge>
  );
};

export const AccountInput = ({id, setId, provider, disabled = false}: any) => {
  return (
    <Input
      aria-label="card"
      underlined
      color="secondary"
      placeholder={`Рахунок ${provider?.name || ''}`}
      width="200px"
      value={id}
      disabled={!!disabled}
      onChange={e => setId((e?.target?.value || '').replaceAll(' ', ''))}
      onBlur={() => {
        if (!provider?.validator?.test(id)) {
          setId('');
        }
      }}
    />
  );
};

export const InfoText = () => (
  <Text color="grey">🧐 Перевір чи все 👌: контрагент має газ, баланс, перекази тощо.</Text>
);

export const WarnText = () => (
  <Text color="grey">
    ❗ Порушення p2p угоди може призвести до виключення зі спільноти та втрати токенів
  </Text>
);

export const P2P = ({balance, gas}: any) => {
  const MM = useConnector();
  const [step, setStep] = useState('p');
  const [int, setInt] = useState('mono');
  const [out, setOut] = useState('polygon');
  const [priority, setPriority] = useState(MIN_FEE);
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [id, setId] = useState('');
  const [signature, setSignature] = useState('');
  const [validSignature, setValidSignature] = useState(false);
  const sign = useSign({MM, setSignature});
  const stamp = useMemo(() => getStamp(), []);
  const [code, setCode] = useState('');

  const listIn = useCallback(() => [...FIAT, ...CHAIN], []);
  const listOut = useCallback(
    (i = int) => {
      return FIAT.some(p => p.name === i) ? CHAIN : FIAT;
    },
    [int]
  );

  const reset = useCallback(() => {
    setSignature('');
    setId('');
    setCode('');
    setValidSignature(false);
    setAmount(MIN_AMOUNT);
    setPriority(MIN_FEE);
  }, [setSignature, setId, setCode, setValidSignature, setAmount, setPriority]);

  const trx = useMemo(() => {
    setValidSignature(false);
    if (code) {
      return parseCode(code);
    }
    return {} as any;
  }, [code]);

  const trxType = useMemo(() => {
    if (trx) {
      return trx?.type?.split('*')[1]?.split('-');
    }
    return [];
  }, [trx]);

  useEffect(() => {
    validateSignature({
      trx,
      setValid: setValidSignature,
      account: trx.payload || trx.account,
    });
  }, [trx, setValidSignature]);

  return (
    <>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button.Group color="gradient" ghost key={step}>
          {[
            {name: 'Оферта', act: 'p'},
            {name: 'Запити', act: 'r'},
            {name: 'Угода', act: 'd'},
          ].map(b => (
            <Button
              key={b.act}
              size="sm"
              auto
              onClick={() => {
                reset();
                setStep(b.act);
              }}
              className={classNames({[styles.action]: step === b.act})}
            >
              {b.name}
            </Button>
          ))}
        </Button.Group>
        <Info
          icon={<MdWarning color="yellow" />}
          text="Платформа не є гарантом чи стороною p2p угоди та надає виключно технічні засоби для підписання."
        />
      </Row>
      {step === 'p' ? (
        <Col className={styles.pv1}>
          <Row align="center" className={styles.mv1}>
            <Info className={styles.partner} text="Вхідний переказ" />
            &nbsp;
            <select
              name="in"
              value={int}
              disabled={!!signature}
              onChange={e => {
                reset();
                setInt(e.target.value);
                setOut(listOut(e.target.value)[0].name);
              }}
            >
              {listIn().map(l => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <div title="Винагорода контрагенту" className={classNames(styles.mv1, styles.pointer)}>
              &#8594; <Agent /> &#8594;
            </div>
            <select
              name="out"
              value={out}
              disabled={!!signature}
              onChange={e => setOut(e.target.value)}
            >
              {listOut().map(l => (
                <option key={l.name} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <Info className={styles.partner} text="Вихідний переказ" />
          </Row>
          <Row className={styles.mv1} align="center">
            <Input
              aria-label="sum"
              underlined
              color="secondary"
              type="number"
              placeholder="Сума"
              width="200px"
              disabled={!!signature}
              value={amount}
              onChange={e => {
                const a = +e?.target?.value;
                setAmount(a);
                setPriority(Math.max(Math.round(a / 100), MIN_FEE));
              }}
              onBlur={() => {
                const a = Math.max(
                  MIN_AMOUNT,
                  Math.min(int === 'polygon' ? Math.floor(balance) : amount, amount, MAX_AMOUNT)
                );
                setAmount(a);
                setPriority(Math.max(priority, MIN_FEE));
              }}
            />
            <Tips
              {...{
                priority,
                setPriority,
                amount,
                min: MIN_FEE,
                infoText: '👌 чай - винагорода контрагенту з суми запиту',
                disabled: !!signature,
              }}
            />
          </Row>
          {int === 'polygon' ? (
            <Row className={styles.mv1}>
              <AccountInput
                {...{id, setId, provider: FIAT.find(p => p.name === out), disabled: !!signature}}
              />
            </Row>
          ) : null}
          <Spacer />
          <Row align="center">
            {(int === 'polygon' && +gas >= MIN_GAS) || int !== 'polygon' ? (
              <Button
                className={styles.button}
                size="sm"
                auto
                disabled={!amount || (int === 'polygon' && !id) || !!signature}
                onClick={() =>
                  sign(
                    createCode({
                      priority,
                      stamp,
                      type: `p2p*${int}-${out}`,
                      source: id,
                      value: amount?.toString(),
                      account: MM.account,
                      encode: false,
                    })
                  )
                }
              >
                <SignText />
              </Button>
            ) : (
              <Text color="error">
                😞 газ {'<'} {MIN_GAS}
              </Text>
            )}
            <Spacer x={0.5} />
            <RequestButton disabled={!signature} onClick={() => setStep('r')} />
            {signature ? (
              <>
                <Address
                  className={styles.ml1}
                  account={`${int}→${out}:${amount} - чай:${priority}  #${createCode({
                    priority,
                    stamp,
                    type: `p2p*${int}-${out}`,
                    source: id,
                    value: amount?.toString(),
                    account: MM.account,
                    signature,
                  })}`}
                />
                <Info className={styles.ml05} text="💬 Додай код запиту в коментарі" />
              </>
            ) : null}
          </Row>
        </Col>
      ) : null}
      {step === 'r' ? (
        <Col className={styles.pv1}>
          <iframe style={{minHeight: '500px', width: '100%', border: 'none'}} src="/p2p.html" />
        </Col>
      ) : null}
      {step === 'd' ? (
        <Col className={styles.pv1}>
          <Row align="center" className={styles.mv1}>
            <Input
              aria-label="code"
              underlined
              color="secondary"
              placeholder="#код"
              width="200px"
              onChange={e => {
                const codeValue = e?.target?.value || '';
                setCode(codeValue.includes('#') ? codeValue.split('#')[1] : codeValue);
              }}
            />
          </Row>
          {trx?.body && validSignature ? (
            <>
              <Col className={styles.mv1}>
                <Row align="center">
                  <b>Тип:</b>&nbsp;
                  <Info className={styles.partner} text="Вхідний переказ" />
                  &nbsp;
                  <Text>{trxType[0]}</Text> → <Text>{trxType[1]}</Text>
                  <Info className={styles.partner} text="Вихідний переказ" />
                </Row>
                <Row>
                  <b>Контрагент:</b>&nbsp;
                  <Address
                    account={
                      trx.account.toLowerCase() !== MM.account.toLowerCase()
                        ? trx.account
                        : trx.payload
                    }
                  />
                  <Info
                    className={styles.ml05}
                    text="ℹ️ Перевірити гаманець можна в розділі ✨ Спільнота DAO"
                  />
                </Row>
                <Row>
                  <b>Сума:</b>&nbsp;{trx.value}
                  <Info
                    className={styles.ml05}
                    text={
                      <span>
                        ℹ️ Рекомендована макс. сума ~{MAX_AMOUNT} <br />
                        Місячний макс. ~{12 * MAX_AMOUNT}
                      </span>
                    }
                  />
                </Row>
                <Row>
                  <b>Чай:</b>&nbsp;{trx.priority}{' '}
                  <Info className={styles.ml05} text="ℹ️ Винагорода з суми запиту" />
                </Row>
                {trx.source && (
                  <Row>
                    <b>Рахунок:</b>&nbsp;
                    <Address account={trx.source} />
                    <Info
                      className={styles.ml05}
                      text={
                        <span>
                          ℹ️ Перевірити рахунок можна на{' '}
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={FIAT.find(p => p.name === trxType[1])?.help}
                          >
                            сайті провайдера
                          </a>
                          <br />
                          Рекомендоване призначення: Повернення боргу
                        </span>
                      }
                    />
                  </Row>
                )}
                {!trx.payload && trx.account.toLowerCase() !== MM.account.toLowerCase() ? (
                  <>
                    {!trx.source && (
                      <Row align="center">
                        Додай свій&nbsp;
                        <AccountInput
                          {...{
                            id,
                            setId,
                            provider: FIAT.find(p => p.name === trxType[0]),
                            disabled: !!signature,
                          }}
                        />
                      </Row>
                    )}
                    <Row className={styles.mv1}>
                      <InfoText />
                    </Row>
                    <Row align="center">
                      👍 Даю згоду&nbsp;
                      {(!trx.type.includes(ON_CHAIN) && +trx.value <= +balance) ||
                      trx.type.includes(ON_CHAIN) ? (
                        (!trx.type.includes(ON_CHAIN) && +gas >= MIN_GAS) ||
                        trx.type.includes(ON_CHAIN) ? (
                          <Button
                            className={styles.button}
                            size="sm"
                            auto
                            disabled={!!signature || !(trx.source || id)}
                            onClick={() => {
                              // eslint-disable-next-line
                              useSign({
                                MM,
                                setSignature: (signature: string) => {
                                  setCode(
                                    createCode({
                                      ...trx,
                                      source: id || trx.source,
                                      payload: MM.account,
                                      signature,
                                    })
                                  );
                                },
                              })(
                                createCode({
                                  ...trx,
                                  source: id || trx.source,
                                  payload: MM.account,
                                  encode: false,
                                })
                              );
                            }}
                          >
                            <SignText />
                          </Button>
                        ) : (
                          <Text color="error">
                            😞 газ {'<'} {MIN_GAS}
                          </Text>
                        )
                      ) : (
                        <Text color="error">
                          😞 баланс {'<'} {trx.value}
                        </Text>
                      )}
                    </Row>
                  </>
                ) : null}
              </Col>

              {trx.payload ? (
                <Col className={styles.mv1}>
                  {trx.account.toLowerCase() !== MM.account.toLowerCase() ? (
                    <Col>
                      <Row align="center" wrap="wrap">
                        <b>1.</b>&nbsp;Надай&nbsp;
                        <FaTelegramPlane color="lightblue" />
                        &nbsp;код угоди&nbsp;
                        <Address account={`#${code}`} />
                        &nbsp;контрагенту та очікуй вхідний переказ 🤝
                      </Row>
                      <Row align="center" wrap="wrap">
                        <b>2.</b>&nbsp;Візьми чай та зроби вихідний переказ на&nbsp;
                        <Address account={trx.type.includes(ON_CHAIN) ? trx.source : trx.account} />
                        &nbsp;💸
                      </Row>
                      <Row className={styles.mv1}>
                        <WarnText />
                      </Row>
                    </Col>
                  ) : (
                    <Col>
                      <Row className={styles.mv1}>
                        <InfoText />
                      </Row>
                      <Row>👍 Даю згоду, тоді:</Row>
                      <Row align="center" wrap="wrap">
                        <b>1.</b>&nbsp;Зроби вхідний переказ на&nbsp;
                        <Address account={trx.type.includes(ON_CHAIN) ? trx.payload : trx.source} />
                        &nbsp;та повідом&nbsp;
                        <FaTelegramPlane color="lightblue" />
                        &nbsp;контрагента 🤝
                      </Row>
                      <Row align="center" wrap="wrap">
                        <b>2.</b>&nbsp;Очікуй вихідний переказ, контрагент візьме чай 💸
                      </Row>
                      <Row className={styles.mv1}>
                        <WarnText />
                      </Row>
                    </Col>
                  )}
                </Col>
              ) : null}

              {!trx.payload && trx.account.toLowerCase() === MM.account.toLowerCase() ? (
                <Col className={styles.mv1}>
                  <Row>
                    Очікуй&nbsp;
                    <FaTelegramPlane color="lightblue" />
                    &nbsp;код угоди від контрагента ⌛
                  </Row>
                </Col>
              ) : null}
            </>
          ) : (
            <>{code && <Text color="error">Код недійсний</Text>}</>
          )}
        </Col>
      ) : null}
    </>
  );
};
