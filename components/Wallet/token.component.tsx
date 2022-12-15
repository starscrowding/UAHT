import {useState} from 'react';
import {Row, Button, Modal, Text} from '@nextui-org/react';
import {useConnector} from '@space/components/Wallet';
import {ADDRESS, TOKEN_LIST} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {useAddToken} from './hooks';
import styles from './wallet.module.scss';

export const Token = () => {
  const MM = useConnector();
  const addToken = useAddToken({MM});
  const [showModal, setShowModal] = useState(false);

  return (
    <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
      {MM.ethereum ? (
        <Button className={styles.button} size="sm" auto onClick={() => addToken()}>
          Додати в Metamask
        </Button>
      ) : null}
      <Button
        className={styles.button}
        size="sm"
        auto
        onClick={() => {
          window.open(`https://tokenlists.org/token-list?url=${TOKEN_LIST}`, '_blank');
        }}
      >
        Токен List
      </Button>
      <Button
        className={styles.button}
        size="sm"
        color="gradient"
        auto
        title="Провайдер ліквідності"
        onClick={() => {
          setTimeout(() => setShowModal(true), 123);
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
      <Modal
        closeButton
        aria-labelledby="modal"
        open={showModal}
        onClose={() => setShowModal(false)}
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
    </Row>
  );
};
