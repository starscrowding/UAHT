import {useState} from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import {Logo} from '@space/components/Logo';
import styles from './card.module.scss';

export const Card = ({className, info, data, qr}: any) => {
  const [flipped, setFlipped] = useState(false);
  const [shake, setShake] = useState(false);

  return (
    <div className={classNames(styles.scene, className)}>
      <div
        className={classNames(styles.card, {
          [styles.flipped]: flipped,
          [styles.shake]: shake,
        })}
        onDoubleClick={() => setFlipped(!flipped)}
        onTouchMove={() => setFlipped(!flipped)}
      >
        <div className={styles.front} onClick={() => setShake(!shake)}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <div className={styles.info}>{info}</div>
          <div className={styles.data}>{data}</div>
        </div>
        <div className={styles.back}>
          <div className={styles.logo}>
            <Image src="/icon.png" width="75" height="75" alt="токен" />
          </div>
          <div className={styles.qr}>{qr}</div>
        </div>
      </div>
    </div>
  );
};
