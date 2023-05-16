import {Text, Col, Row} from '@nextui-org/react';
import {JAR} from '@space/hooks/api';
import {Address} from './common';
import {QRCode} from './qr.component';
import styles from './wallet.module.scss';

export const Jar = ({resource}: any) => {
  return (
    <div>
      <div className={styles.mv1}>
        <Text small color="grey">
          🔐 через &nbsp;
          <select>
            <option>USDT</option>
            <option>USDC</option>
          </select>
          &nbsp; за{' '}
          <a
            href="https://bank.gov.ua/ua/markets/exchangerate-chart?cn%5B%5D=USD"
            rel="noreferrer"
            target="_blank"
            className={styles.link}
          >
            офіційним курсом
          </a>
        </Text>
      </div>
      <Col className={styles.mv1}>
        <QRCode value={JAR} title="USDT ↔ USDC" />
      </Col>
      <Row align="center">
        <Address account={JAR} className={styles.m05} />
      </Row>
    </div>
  );
};
