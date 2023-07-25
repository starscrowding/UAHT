import {useState} from 'react';
import {Row, Button} from '@nextui-org/react';
import {ADDRESS, POLYGON_NETWORK, USDT_ADDRESS} from '@space/hooks/api';
import {TbArrowsRightLeft} from 'react-icons/tb';
import {P2P} from './p2p.component';
import styles from './wallet.module.scss';

export const Swap = ({balance, gas}: any) => {
  const [act, setAct] = useState('');

  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button
          className={styles.button}
          size="sm"
          light
          color={act === 'p2p' ? 'gradient' : undefined}
          auto
          onClick={() => {
            if (act === 'p2p') {
              setAct('');
            } else {
              setAct('p2p');
            }
          }}
        >
          📢
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(
              `https://app.1inch.io/#/${POLYGON_NETWORK}/simple/swap/${USDT_ADDRESS}/${ADDRESS}`,
              '_blank'
            );
          }}
        >
          1inch
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(
              `https://www.okx.com/ua/web3/dex#inputChain=${POLYGON_NETWORK}&inputCurrency=${USDT_ADDRESS}&outputChain=${POLYGON_NETWORK}&outputCurrency=${ADDRESS}`,
              '_blank'
            );
          }}
        >
          OKX
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(`https://richamster.com/trade/MATIC_UAHT/`, '_blank');
          }}
        >
          Richamster
        </Button>
        <Button
          className={styles.button}
          size="sm"
          color={act === 'uniswap' ? 'gradient' : undefined}
          auto
          onClick={() => {
            window.open(
              `https://app.uniswap.org/#/swap?exactAmount=1&exactField=input&inputCurrency=${USDT_ADDRESS}&outputCurrency=${ADDRESS}&chain=polygon&lng=uk-UA`,
              '_blank'
            );
          }}
        >
          Uniswap
        </Button>
        <a
          title="UahtSwap"
          onClick={() => {
            window.open(`/swap/index.html`, '_blank');
          }}
        >
          <TbArrowsRightLeft />
        </a>
      </Row>
      {act === 'uniswap' && <iframe className={styles.swap} src="/swap/index.html" />}
      {act === 'p2p' && <P2P {...{balance, gas}} />}
    </div>
  );
};
