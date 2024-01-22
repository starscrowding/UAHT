import {useCallback, useState, useEffect} from 'react';
import NextImage from 'next/image';
import {useRouter} from 'next/router';
import {toast} from 'react-toastify';
import {Row, Button, Modal, Text, Input} from '@nextui-org/react';
import {MdQrCode} from 'react-icons/md';
import {FaDownload} from 'react-icons/fa';
import {BiTransferAlt} from 'react-icons/bi';
import {uahtABI} from '@uaht/sdk';
import {Address as AddressType} from 'viem';
import {useConnector} from '@space/components/Wallet';
import {ADDRESS, BASE, BASE_COM, USDT_ADDRESS, CONTRACT} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {QRCode} from './qr.component';
import {useAddToken} from './hooks';
import {Address} from './common';
import {sanitizeInput} from './helpers';
import styles from './wallet.module.scss';

export const TransferAmount = ({amount, setAmount, disabled, placeholder = 'UAHT'}: any) => {
  return (
    <>
      Сума:&nbsp;
      <Input
        aria-label="sum"
        underlined
        color="secondary"
        type="number"
        placeholder={placeholder}
        width="150px"
        value={amount}
        disabled={disabled}
        onChange={e => {
          setAmount(e?.target?.value);
        }}
        onBlur={() => setAmount(amount && Math.max(0, Number(amount)))}
        onKeyDown={sanitizeInput}
      />
    </>
  );
};

export const QRModal = ({open}: any) => {
  const MM = useConnector();
  const router = useRouter();
  const [amount, setAmount] = useState<number | string>();
  const [slot, setSlot] = useState<string>((router?.query?.slot as unknown) as string);

  const unwatch = MM?.provider?.watchContractEvent({
    address: ADDRESS,
    abi: uahtABI,
    eventName: 'Transfer',
    args: {
      to: MM?.account as AddressType,
    },
    batch: false,
    onLogs(logs: any) {
      try {
        toast.success(`Отримано: ${Number(logs?.[0]?.args?.value || 0) / 100} UAHT`, {
          toastId: 'qr',
        });
        onClose();
      } catch (e) {
        console.log(e);
      }
    },
  });

  const reset = useCallback(() => {
    setAmount('');
  }, [setAmount]);

  const onClose = () => {
    reset();
    unwatch?.();
    router.replace('/');
  };

  useEffect(() => {
    setSlot(router?.query?.slot as string);
  }, [router?.query, setSlot]);

  const qr = !slot
    ? `${BASE}/?action=transfer&to=${MM.account}${amount ? `&amount=${amount}` : ''}`
    : `${BASE_COM}/offers/${MM.account}/${slot}${amount ? `?amount=${amount}` : ''}`;

  const download = () => {
    try {
      const svg = document.getElementById('UAHT_QRCode') as HTMLElement;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'UAHT_QRCode';
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal blur preventClose closeButton aria-labelledby="qr-modal" open={open} onClose={onClose}>
      <Modal.Header>
        <Text size={18}>
          <a
            onClick={() => {
              window.open(
                `https://polygonscan.com/advanced-filter?tkn=${ADDRESS}&txntype=2&tadd=${MM.account}&mtd=0xa9059cbb%7eTransfer`,
                '_blank'
              );
            }}
          >
            <BiTransferAlt size="18" />
          </a>{' '}
          Твій QR-код <MdQrCode />
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" justify="space-between" className={styles.pb1}>
          <TransferAmount {...{amount, setAmount}} />
          <Input
            size="xs"
            aria-label="slot"
            type="number"
            labelPlaceholder="Слот"
            width="100px"
            min="0"
            value={slot}
            onChange={e => setSlot(e.target.value)}
          />
        </Row>
        <Row
          align="center"
          justify="space-evenly"
          className={styles.pb1}
          style={{minHeight: '272px'}}
        >
          <QRCode id="UAHT_QRCode" value={qr} title="UAHT" />
        </Row>
        <Row align="center" justify="space-around" className={styles.pb1}>
          <Button
            className={styles.button}
            size="sm"
            auto
            flat
            title="Зберегти"
            onClick={() => download()}
          >
            <FaDownload size="18" />
          </Button>
          <Address account={qr} />
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export const StakingModal = ({open}: any) => {
  const router = useRouter();

  return (
    <Modal
      blur
      preventClose
      closeButton
      aria-labelledby="modal"
      open={open}
      onClose={() => router.replace('/')}
    >
      <Modal.Header>
        <Text size={18}>Обери провайдера 🤖</Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" justify="space-evenly" className={styles.pb1}>
          <Button
            as="a"
            target="_blank"
            rel="noreferrer"
            auto
            ghost
            size="lg"
            color="gradient"
            icon="🦄"
            href={`https://app.uniswap.org/add/${USDT_ADDRESS}/${ADDRESS}/3000?chain=polygon&lng=uk-UA`}
          >
            Uniswap
          </Button>
          <Button
            as="a"
            target="_blank"
            rel="noreferrer"
            auto
            ghost
            size="lg"
            icon="📈"
            href={`https://defillama.com/dexs/chains/polygon`}
          >
            Інші ...
          </Button>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export const Token = () => {
  const MM = useConnector();
  const router = useRouter();
  const addToken = useAddToken({MM});

  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        {MM.ethereum ? (
          <Button
            className={styles.button}
            size="sm"
            auto
            flat
            title="Додати в Metamask"
            onClick={() => addToken()}
          >
            <NextImage src="/metamask.svg" width="16" height="16" alt="Metamask" />+
          </Button>
        ) : null}
        <Button
          className={styles.button}
          size="sm"
          auto
          flat
          title="Створити QR код"
          onClick={() => {
            setTimeout(() => router.push('/?action=qr'), 123);
          }}
        >
          <MdQrCode size="18" />
        </Button>
        <Button
          className={styles.button}
          size="sm"
          color="gradient"
          auto
          title="Провайдер ліквідності"
          onClick={() => {
            setTimeout(() => router.push('/?action=staking'), 123);
          }}
        >
          Стейкінг 🌱
        </Button>
        <Info
          className={styles.partner}
          text={
            <>
              Можливість зрощувати 🌱 активи через{' '}
              <a
                href="https://academy.binance.com/uk/articles/what-are-liquidity-pools-in-defi"
                target="_blank"
                rel="noreferrer"
              >
                пули ліквідності
              </a>{' '}
              🐳
            </>
          }
        />
      </Row>
      <Button
        size="xs"
        auto
        flat
        onClick={() => {
          window.open(`${CONTRACT}/?a=${MM.account}`, '_blank');
        }}
        icon={<BiTransferAlt />}
      >
        транзакції
      </Button>
    </div>
  );
};
