import {useState} from 'react';
import {useRouter} from 'next/router';
import {Text, Col, Row, Button} from '@nextui-org/react';
import {MdAddCircleOutline} from 'react-icons/md';
import {JAR, USDT_ADDRESS} from '@space/hooks/api';
import {TransferAmount} from '@space/components/Wallet/token.component';
import {useERC20} from './hooks';
import styles from './wallet.module.scss';

export const Jar = () => {
  const router = useRouter();
  const usdt = useERC20(USDT_ADDRESS);
  const [amount, setAmount] = useState<number | string>(
    (router?.query?.amount as unknown) as string
  );

  const add = async () => {
    await usdt.transfer(JAR, Number(amount) * 10 ** 6);
  };

  return (
    <div>
      <Col className={styles.mv1}>
        <TransferAmount {...{amount, setAmount, placeholder: 'USDT'}} />
      </Col>

      <div className={styles.mv1}>
        <Text color="grey">
          🔐 за{' '}
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

      <Row align="center" justify="center" className={(styles.mv1, styles.pt1)}>
        <Button disabled={!amount} onClick={() => add()}>
          Поповнення&nbsp;
          <MdAddCircleOutline color="green" size="18" />
        </Button>
      </Row>
    </div>
  );
};
