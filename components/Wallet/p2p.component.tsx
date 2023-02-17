import {useCallback, useState} from 'react';
import classNames from 'classnames';
import {IoPerson} from 'react-icons/io5';
import {FaQuestionCircle} from 'react-icons/fa';
import {MdWarning} from 'react-icons/md';
import {Row, Col, Badge, Input} from '@nextui-org/react';
import {Info} from '@space/components/Info';
import {CONTRACT} from '@space/hooks/api';
import styles from './wallet.module.scss';

export const MIN_GAS = 0.1;
export const MIN_FEE = 20;
export const MIN_AMOUNT = MIN_FEE * 10;
export const MAX_AMOUNT = 25 * 10 ** 3;

export const cardValidator = (c: string) => /^[0-9]+$/.test(c) && c?.length > 13;

export const FIAT = [
  {
    name: 'sendmoney',
    color: '#75af26',
    help: 'https://privatbank.ua/sendmoney',
  },
];
export const CHAIN = [{name: 'polygon', color: '#7b3fe5', help: CONTRACT}];

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

export const P2P = ({balance, gas}: any) => {
  const [int, setInt] = useState('sendmoney');
  const [out, setOut] = useState('polygon');
  const [amount, setAmount] = useState(MIN_AMOUNT);

  const updateAmount = (v: number = MIN_AMOUNT, i = int) => {
    const a =
      i === 'polygon'
        ? Math.min(Math.floor(balance), v)
        : Math.max(MIN_AMOUNT, Math.min(v, MAX_AMOUNT));
    setAmount(a);
  };

  const listIn = useCallback(() => [...FIAT, ...CHAIN], []);
  const listOut = useCallback(
    (i = int) => {
      return FIAT.some(p => p.name === i) ? CHAIN : FIAT;
    },
    [int]
  );

  const msg = useCallback(() => (int === FIAT[0].name ? `куплю ${amount}` : `продам ${amount}`), [
    int,
    amount,
  ]);

  return (
    <>
      <Col>
        <Row align="center">
          <Info
            className={styles.partner}
            link={[...FIAT, ...CHAIN].find(i => i.name === int)?.help}
          />
          &nbsp;
          <select
            name="in"
            className={styles.address}
            value={int}
            onChange={e => {
              setInt(e.target.value);
              setOut(listOut(e.target.value)[0].name);
              updateAmount(MIN_AMOUNT, e.target.value);
            }}
          >
            {listIn().map(l => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <Input
            aria-label="sum"
            className={styles.address}
            underlined
            color="secondary"
            type="number"
            placeholder="Сума"
            width="100px"
            value={amount}
            onChange={e => {
              const a = +e?.target?.value;
              setAmount(a);
            }}
            onBlur={() => {
              updateAmount(amount);
            }}
          />
          <Info
            text="Винагорода контрагенту згідно p2p угоди"
            className={classNames(styles.pointer)}
            icon={
              <div style={{minWidth: '50px'}}>
                🤝
                <Agent />
              </div>
            }
          />
          <select
            name="out"
            className={styles.address}
            value={out}
            onChange={e => setOut(e.target.value)}
          >
            {listOut().map(l => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <Info
            className={styles.partner}
            link={[...FIAT, ...CHAIN].find(o => o.name === out)?.help}
          />
        </Row>

        <Row align="center" className={styles.mt05}>
          🗣️&nbsp;
          <i>{msg()}</i>
          <Info
            icon={<FaQuestionCircle color="white" />}
            className={styles.ml05}
            text={
              <>
                <MdWarning color="yellow" />
                &nbsp; Платформа надає виключно інформаційні послуги:
                <br />
                <br />
                💬 Додай оголошення в коментарі
                <br />✨ Спільнота DAO для перевірок 🧐 та підписів ✍️
                <br />
                🫙 Банка може ескроу для токенів
                <br />
                💸{' '}
                <a href={FIAT[0].help} target="_blank" rel="noreferrer">
                  Sendmoney
                </a>{' '}
                - грошові перекази по Україні
                <br />
                <br />❗ Порушення p2p угоди чи скам може призвести до виключення зі спільноти та
                втрати активів.
              </>
            }
          />
        </Row>
      </Col>

      <Col className={styles.pv1}>
        <iframe className={styles.swap} src="/p2p.html" />
      </Col>
    </>
  );
};
