import {useState} from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import {Row, Text, Button, Checkbox} from '@nextui-org/react';
import {Info} from '@space/components/Info';
import {Address, RequestButton} from './common';
import {createCode} from './helpers';
import styles from './wallet.module.scss';

export enum JAR_VALUE {
  jam = 'jam',
  pie = 'pie',
}

export const Jar = ({MM, stamp}: any) => {
  const priority = 0;
  const [value, setValue] = useState(JAR_VALUE.jam);
  const [ack, setAck] = useState(false);

  return (
    <div>
      <Row align="center" className={styles.pl05}>
        <Text color="$gray800">{value === JAR_VALUE.jam ? `🍯` : `🍰`} пропозиція:</Text>
        <Button.Group size="sm" auto color="gradient" ghost key={value}>
          <Button
            title="Джем-пул"
            onClick={() => setValue(JAR_VALUE.jam)}
            className={classNames({[styles.action]: value === JAR_VALUE.jam})}
          >
            Джем
          </Button>
          <Button
            title="Операційна частка"
            onClick={() => setValue(JAR_VALUE.pie)}
            className={classNames({[styles.action]: value === JAR_VALUE.pie})}
          >
            Пай
          </Button>
        </Button.Group>
      </Row>
      <div className={styles.mv1}>
        {value === JAR_VALUE.jam ? (
          <Text small color="grey">
            🔐 генерація uniswap-пулів повного діапазону MATIC ↔ UAHT ↔ USDT 🌱
            <br />
            Приклад{' '}
            <a
              href="https://opensea.io/0xB0AA11ad57386c91Fe8FA26E4F32121f9a0Ede03"
              target="_blank"
              rel="noreferrer"
            >
              джем-пула 👀
            </a>
          </Text>
        ) : (
          <Text small color="grey">
            🔐 генерація allowance - операційна частка спільноти UAHT
            <br />
            Пай дозволяє оперувати обліком токенів в межах внесеного стейка{' '}
            <Image src="/icon.png" width="15" height="15" alt="UAHT" />
          </Text>
        )}
      </div>
      <div className={styles.mv1}>
        <Checkbox isSelected={ack} size="xs" onChange={a => setAck(a)}>
          <Row wrap="wrap">
            розумію інвестиційні ризики&nbsp;
            <a
              href="https://academy.binance.com/uk/articles/what-are-smart-contracts"
              target="_blank"
              rel="noreferrer"
            >
              смарт-контрактів
            </a>
            &nbsp;та&nbsp;
            <a
              href="https://academy.binance.com/uk/articles/what-are-liquidity-pools-in-defi"
              target="_blank"
              rel="noreferrer"
            >
              пулів ліквідності 🐳
            </a>
          </Row>
        </Checkbox>
      </div>
      <Row className={styles.mv1} align="center" wrap="wrap">
        <RequestButton disabled={!ack} />
        {ack ? (
          <>
            <Address
              className={styles.ml1}
              account={createCode({
                priority,
                stamp,
                type: 'i',
                source: 'jar',
                value,
                account: MM.account,
              })}
            />
            <Info text="Скопіюй та відправ код запиту 🤝" className={styles.ml1} />
          </>
        ) : null}
      </Row>
      <div>
        <Text small color="grey">
          * транзакції та чай за згодою сторін
        </Text>
      </div>
    </div>
  );
};
