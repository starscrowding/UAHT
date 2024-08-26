import {useState, useEffect} from 'react';
import {isAddress} from 'viem';
import {useRouter} from 'next/router';
import {toast} from 'react-toastify';
import {BiTransferAlt} from 'react-icons/bi';
import {Row, Text, Modal, Button, Input} from '@nextui-org/react';
import {Address} from '@space/components/Wallet/common';
import {useConnector} from '@space/components/Wallet';
import {TransferAmount, QRModal, StakingModal} from '@space/components/Wallet/token.component';
import {ADDRESS} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {useUaht, useUahtCheckout} from './hooks';
import styles from './wallet.module.scss';

export const Actions = () => {
  const MM = useConnector();
  const {query} = useRouter();

  return MM.wallet && MM.provider ? (
    <>
      <AllowanceModal
        open={query?.action === 'approve' && query?.spender && Number(query?.amount) >= 0}
      />
      <TransferModal open={query?.action === 'transfer'} />
      <QRModal open={query?.action === 'qr'} />
      <StakingModal open={query?.action === 'staking'} />
    </>
  ) : null;
};

export const AllowanceModal = ({open}: any) => {
  const router = useRouter();
  const uaht = useUaht();

  const approve = async () => {
    try {
      await uaht.approve(router?.query?.spender as string, Number(router?.query?.amount) * 100);
    } catch (e) {
      console.log(e);
      const {message} = e as any;
      toast(message);
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
  const uahtCheckout = useUahtCheckout();
  const MM = useConnector();
  const [to, setTo] = useState<string>((router?.query?.to as unknown) as string);
  const [amount, setAmount] = useState<number | string>(
    (router?.query?.amount as unknown) as string
  );
  const [msg, setMsg] = useState<string>((router?.query?.msg as unknown) as string);

  const validateTo = () => {
    if (!isAddress(to)) {
      setTo('');
    }
  };

  const tranfer = async () => {
    try {
      const value = Number(amount) * 100;
      if (msg) {
        await uahtCheckout.transfer(to, msg, value);
      } else {
        await uaht.transfer(to, value);
      }
    } catch (e) {
      console.log(e);
      const {message} = e as any;
      toast(message);
    } finally {
      router.replace('/');
    }
  };

  useEffect(() => {
    setTo(router?.query?.to as string);
    setAmount(router?.query?.amount as string);
    setMsg(router?.query?.msg as string);
  }, [router?.query, setTo, setAmount, setMsg]);

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
          <a
            onClick={() => {
              window.open(
                `https://polygonscan.com/advanced-filter?tkn=${ADDRESS}&txntype=2&fadd=${MM.account}&mtd=0xa9059cbb%7eTransfer`,
                '_blank'
              );
            }}
          >
            <BiTransferAlt size="18" />
          </a>{' '}
          Трансфер
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
        <Row align="center" className={styles.mv1} css={{gap: '1rem'}}>
          <Info text="👀 Публічний коментар у блокчейн мережі 💬" />
          <textarea
            style={{border: '1px dashed #393a3c', width: '100%'}}
            placeholder="призначення"
            aria-label="msg"
            color="secondary"
            value={msg}
            disabled={!!router?.query?.msg}
            onChange={e => setMsg(e?.target?.value)}
          />
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
