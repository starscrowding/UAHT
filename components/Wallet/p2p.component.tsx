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
  return (
    <>
      <Col>
        <Row align="center" className={styles.mt05}>
          <Info
            text="контрагент p2p угоди"
            className={classNames(styles.pointer)}
            icon={
              <div style={{minWidth: '50px'}}>
                <Agent /> 🤝 &nbsp;
              </div>
            }
          />
          оголошення
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
