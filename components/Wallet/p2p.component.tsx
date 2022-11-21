import {Row} from '@nextui-org/react';
import {Info} from '@space/components/Info';
import {RequestButton} from './common';
import {INFO, DAO} from '@space/hooks/api';
import styles from './wallet.module.scss';

export const BANKS = [
  {name: 'privat24', color: '#75af26'},
  {name: 'mono', color: '#fa5255'},
];

export const P2P = () => {
  return (
    <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
      <RequestButton to={DAO} disabled={true} />
      <Info
        className={styles.ml05}
        text={
          <>
            🚧 Вже скоро. Слідкуй 👀 за новинами проєкту{' '}
            <a href={INFO} target="_blank" rel="noreferrer">
              @uaht_info
            </a>
          </>
        }
      />
    </Row>
  );
};
