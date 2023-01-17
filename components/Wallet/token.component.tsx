import {useCallback, useState} from 'react';
import {useRouter} from 'next/router';
import {Row, Button, Modal, Text, Input} from '@nextui-org/react';
import {MdAddCircleOutline, MdQrCode} from 'react-icons/md';
import {FaDownload} from 'react-icons/fa';
import {BiTransferAlt} from 'react-icons/bi';
import {useConnector} from '@space/components/Wallet';
import {ADDRESS, BASE} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {QRCode} from './qr.component';
import {useAddToken} from './hooks';
import {Address} from './common';
import styles from './wallet.module.scss';

export const TransferAmount = ({amount, setAmount, disabled}: any) => {
  return (
    <>
      Сума:&nbsp;
      <Input
        aria-label="sum"
        underlined
        color="secondary"
        type="number"
        placeholder="UAHT"
        width="150px"
        value={amount}
        disabled={disabled}
        onChange={e => {
          setAmount(e?.target?.value);
        }}
        onBlur={() => setAmount(amount && Math.max(0, Number(amount)))}
      />
    </>
  );
};

export const QRModal = ({showQRModal, setShowQRModal, MM}: any) => {
  const [amount, setAmount] = useState<number | string>();

  const reset = useCallback(() => {
    setAmount('');
  }, [setAmount]);

  const qr = `${BASE}/?action=transfer&to=${MM.account}${amount ? `&amount=${amount}` : ''}`;

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
    <Modal
      preventClose
      closeButton
      aria-labelledby="modal"
      open={showQRModal}
      onClose={() => {
        reset();
        setShowQRModal(false);
      }}
    >
      <Modal.Header>
        <Text size={18}>
          Твій qr-код <MdQrCode />
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" justify="flex-start" className={styles.pb1}>
          <TransferAmount {...{amount, setAmount}} />
        </Row>
        <Row
          align="center"
          justify="space-evenly"
          className={styles.pb1}
          style={{minHeight: '272px'}}
        >
          <QRCode id="UAHT_QRCode" value={qr} />
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

export const StakingModal = ({showStakingModal, setShowStakingModal}: any) => {
  return (
    <Modal
      closeButton
      aria-labelledby="modal"
      open={showStakingModal}
      onClose={() => setShowStakingModal(false)}
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
            icon="🔄"
            href={`https://app.ws.exchange/ua/eth/pool/add?chainId=137&inputCurrency=${ADDRESS}&outputCurrency=0xc2132D05D31c914a87C6611C10748AEb04B58e8F`}
          >
            WhiteSwap
          </Button>
          <Button
            as="a"
            target="_blank"
            rel="noreferrer"
            auto
            ghost
            size="lg"
            color="gradient"
            icon="🦄"
            href={`https://app.uniswap.org/#/add/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/${ADDRESS}/3000?chain=polygon&lng=uk-UA`}
          >
            Uniswap
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
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);

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
            <MdAddCircleOutline size="18" />
          </Button>
        ) : null}
        <Button
          className={styles.button}
          size="sm"
          auto
          flat
          title="Зробити трансфер"
          onClick={() => router.push('/?action=transfer')}
        >
          <BiTransferAlt size="18" />
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          flat
          title="Створити QR код"
          onClick={() => {
            setTimeout(() => setShowQRModal(true), 123);
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
            setTimeout(() => setShowStakingModal(true), 123);
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
        <QRModal {...{showQRModal, setShowQRModal, MM}} />
        <StakingModal {...{showStakingModal, setShowStakingModal}} />
      </Row>
    </div>
  );
};
