import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {useRouter} from 'next/router';
import {BiTransferAlt} from 'react-icons/bi';
import {Row, Text, Modal, Button, Input} from '@nextui-org/react';
import {Address} from '@space/components/Wallet/common';
import {TransferAmount} from '@space/components/Wallet/token.component';
import {useUaht} from './hooks';
import styles from './wallet.module.scss';

export const Actions = () => {
  const [ready, setReady] = useState(false);
  const {query} = useRouter();

  useEffect(() => {
    setReady(true);
  }, []);

  if (ready) {
    if (query?.action === 'approve' && query?.spender && Number(query?.amount) >= 0) {
      return <AllowanceModal />;
    }
    if (query?.action === 'transfer') {
      return <TransferModal />;
    }
  }
  return null;
};

export const AllowanceModal = () => {
  const router = useRouter();
  const uaht = useUaht();

  const approve = async () => {
    try {
      await uaht.approve(router?.query?.spender, Number(router?.query?.amount) * 100);
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
          Адреса: <Address className={styles.ml1} account={router?.query?.spender as string} />
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
  const [to, setTo] = useState<string>((router?.query?.to as unknown) as string);
  const [amount, setAmount] = useState<number | string>(
    (router?.query?.amount as unknown) as string
  );

  const validateTo = () => {
    if (!ethers.utils.isAddress(to)) {
      setTo('');
    }
  };

  const tranfer = async () => {
    try {
      await uaht.transfer(to, Number(amount) * 100);
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
        <Text size={18}>
          <BiTransferAlt size="18" /> Зробити трансфер
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" className={styles.mv1}>
          Отримувач:{' '}
          {router?.query?.to ? (
            <Address className={styles.ml1} account={router?.query?.to as string} />
          ) : (
            <Input
              aria-label="to"
              underlined
              color="secondary"
              type="text"
              value={to}
              onChange={e => setTo(e?.target?.value)}
              onBlur={() => validateTo()}
            />
          )}
        </Row>
        <Row align="center" className={styles.mv1}>
          <TransferAmount {...{amount, setAmount, disabled: !!router?.query?.amount}} />
        </Row>
        <Row align="center" justify="center" className={styles.mv1}>
          <Button disabled={!to || !amount} onClick={() => tranfer()}>
            Відправити ➡️
          </Button>
        </Row>
      </Modal.Body>
    </Modal>
  );
};
