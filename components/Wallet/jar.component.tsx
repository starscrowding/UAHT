import {useState} from 'react';
import {useRouter} from 'next/router';
import {toast} from 'react-toastify';
import {Text, Col, Row, Button} from '@nextui-org/react';
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
    try {
      await usdt.transfer(JAR, Number(amount) * 10 ** 6);
    } catch (e) {
      console.log(e);
      const {message} = e as any;
      toast(message);
    } finally {
      router.replace('/');
    }
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
            href="https://www.google.com/finance/quote/USDT-UAH#T"
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
          Ввід ✅
        </Button>
      </Row>
    </div>
  );
};
