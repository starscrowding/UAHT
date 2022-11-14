import {Row, Button} from '@nextui-org/react';
import {ADDRESS} from '@space/hooks/api';
import styles from './wallet.module.scss';

export const Trade = () => {
  return (
    <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
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
      <Button
        className={styles.button}
        size="sm"
        auto
        onClick={() => {
          window.open(
            `https://app.ws.exchange/eth/swap?chainId=137&inputCurrency=${ADDRESS}`,
            '_blank'
          );
        }}
      >
        WhiteSwap
      </Button>
      <Button
        className={styles.button}
        size="sm"
        color="gradient"
        auto
        onClick={() => {
          window.open(`https://app.uniswap.org/#/tokens/polygon/${ADDRESS}`, '_blank');
        }}
      >
        Uniswap
      </Button>
    </Row>
  );
};
