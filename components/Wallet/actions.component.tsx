import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {useRouter} from 'next/router';
import {toast} from 'react-toastify';
import {BiTransferAlt} from 'react-icons/bi';
import {Row, Text, Modal, Button, Input} from '@nextui-org/react';
import {Address} from '@space/components/Wallet/common';
import {Jar} from '@space/components/Wallet/jar.component';
import {TransferAmount, QRModal, StakingModal} from '@space/components/Wallet/token.component';
import {useUaht} from './hooks';
import styles from './wallet.module.scss';

export const Actions = () => {
  const {query} = useRouter();

  return (
    <>
      <AllowanceModal
        open={query?.action === 'approve' && query?.spender && Number(query?.amount) >= 0}
      />
      <TransferModal open={query?.action === 'transfer'} />
      <JarModal open={query?.action === 'jar'} />
      <QRModal open={query?.action === 'qr'} />
      <StakingModal open={query?.action === 'staking'} />
    </>
  );
};

export const AllowanceModal = ({open}: any) => {
  const router = useRouter();
  const uaht = useUaht();

  const approve = async () => {
    try {
      await uaht.approve(router?.query?.spender, Number(router?.query?.amount) * 100);
    } catch (e) {
      console.log(e);
      const {reason} = e as any;
      toast(reason);
    } finally {
      router.replace('/');
    }
  };

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="allowance-modal"
      open={open}
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

export const TransferModal = ({open}: any) => {
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
      const {reason} = e as any;
      toast(reason);
    } finally {
      router.replace('/');
    }
  };

  useEffect(() => {
    setTo(router?.query?.to as string);
    setAmount(router?.query?.amount as string);
  }, [router?.query, setTo, setAmount]);

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="transfer-modal"
      open={open}
      onClose={() => router.replace('/')}
    >
      <Modal.Header>
        <Text size={18}>
          <BiTransferAlt size="18" /> Трансфер
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

export const JarModal = ({open}: any) => {
  const router = useRouter();

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="jar-modal"
      open={open}
      onClose={() => router.replace('/')}
    >
      <Modal.Header>
        <Text size={18}>
          <BiTransferAlt size="18" /> Конвертер
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Jar />
      </Modal.Body>
    </Modal>
  );
};
