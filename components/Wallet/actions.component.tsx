import {useState} from 'react';
import {useRouter} from 'next/router';
import {Row, Text, Modal, Button} from '@nextui-org/react';
import {Address} from '@space/components/Wallet/common';
import {TransferAmount} from '@space/components/Wallet/token.component';
import {useUaht} from './hooks';
import styles from './wallet.module.scss';

export const Actions = () => {
  const {query} = useRouter();
  if (query?.action === 'approve' && query?.spender && query?.amount) {
    return <AllowanceModal />;
  }
  if (query?.action === 'transfer' && query?.to) {
    return <TransferModal />;
  }
  return null;
};

export const AllowanceModal = () => {
  const router = useRouter();
  const uaht = useUaht();

  const approve = async () => {
    try {
      await uaht.approve(router?.query?.spender, router?.query?.amount);
    } catch (e) {
      console.log(e);
    } finally {
      router.replace('/');
    }
  };

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="a-modal"
      open={true}
      onClose={() => router.replace('/')}
    >
      <Modal.Header>
        <Text size={18}>❗ Дозвіл на операцію</Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" className={styles.mv1}>
          Гаманець: <Address className={styles.ml1} account={router?.query?.spender as string} />
        </Row>
        <Row align="center" className={styles.mv1}>
          Сума: {router?.query?.amount}
        </Row>
        <Row align="center" justify="center" className={styles.mv1}>
          <Button onClick={() => approve()}>Даю згоду 👍</Button>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export const TransferModal = () => {
  const router = useRouter();
  const uaht = useUaht();
  const [amount, setAmount] = useState<number | string>(
    (router?.query?.amount as unknown) as string
  );

  const tranfer = async () => {
    try {
      await uaht.transfer(router?.query?.to, Number(amount) * 100);
    } catch (e) {
      console.log(e);
    } finally {
      router.replace('/');
    }
  };

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="a-modal"
      open={true}
      onClose={() => router.replace('/')}
    >
      <Modal.Header>
        <Text size={18}>💸 Зробити переказ</Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" className={styles.mv1}>
          Отримувач: <Address className={styles.ml1} account={router?.query?.to as string} />
        </Row>
        <Row align="center" className={styles.mv1}>
          <TransferAmount {...{amount, setAmount, disabled: !!router?.query?.amount}} />
        </Row>
        <Row align="center" justify="center" className={styles.mv1}>
          <Button disabled={!router?.query?.to || !amount} onClick={() => tranfer()}>
            Відправити ➡️
          </Button>
        </Row>
      </Modal.Body>
    </Modal>
  );
};
