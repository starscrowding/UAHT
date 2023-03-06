import {Text} from '@nextui-org/react';
import {RequestButton} from './common';
import {QRCode} from './qr.component';
import styles from './wallet.module.scss';

export const Jar = ({resource}: any) => {
  return (
    <div>
      <div className={styles.mv1}>
        <Text small color="grey">
          🔐 взяти UAHT під &nbsp;
          <select>
            <option>USDT</option>
            <option>USDC</option>
            <option disabled>ОВДП</option>
          </select>
        </Text>
      </div>
      <div className={styles.mv1}>
        <QRCode value="0xD0920a91B0d382C1B0e83DB36178f808AF881121" title="USDT ↔ USDC" />
      </div>
      <div>
        <RequestButton action="🤝" />
      </div>
      <div>
        <Text small color="grey">
          * індивідуальні умови для партнерів
        </Text>
      </div>
    </div>
  );
};
