import {useState} from 'react';
import {Row, Button} from '@nextui-org/react';
import {ADDRESS, POLYGON_NETWORK, USDT_ADDRESS} from '@space/hooks/api';
import {P2P} from './p2p.component';
import styles from './wallet.module.scss';

export const Swap = ({balance, gas}: any) => {
  const [act, setAct] = useState('uniswap');

  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button
          className={styles.button}
          size="sm"
          light
          color={act === 'p2p' ? 'gradient' : undefined}
          auto
          onClick={() => setAct('p2p')}
        >
          📢
        </Button>
        <Button
          className={styles.button}
          size="sm"
          color={act === 'uniswap' ? 'gradient' : undefined}
          auto
          onClick={() => {
            if (act !== 'uniswap') {
              setAct('uniswap');
            } else {
              window.open(`https://app.uniswap.org/#/swap?chain=polygon&lng=uk-UA`, '_blank');
            }
          }}
        >
          Uniswap
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
              `https://www.okx.com/ua/web3/dex?inputChain=${POLYGON_NETWORK}&inputCurrency=${USDT_ADDRESS}&outputChain=${POLYGON_NETWORK}&outputCurrency=${ADDRESS}`,
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
            window.open(
              `https://app.ws.exchange/uk/eth/polygon/swap?inputCurrency=MATIC`,
              '_blank'
            );
          }}
        >
          WhiteSwap
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(`https://richamster.com/trade/MATIC_UAHT/?referral=nSMDbuIpnPdx`, '_blank');
          }}
        >
          Richamster
        </Button>
      </Row>
      {act === 'uniswap' && <iframe className={styles.swap} src="/swap/index.html" />}
      {act === 'p2p' && <P2P {...{balance, gas}} />}
    </div>
  );
};
