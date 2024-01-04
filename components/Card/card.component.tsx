import {useState, useEffect} from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import {Text, Row} from '@nextui-org/react';
import {Logo} from '@space/components/Logo';
import styles from './card.module.scss';

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}

export const Card = ({className, info, data, qr, flipped, setFlipped}: any) => {
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
            <Row align="center" css={{gap: '0.5rem'}}>
              <Text h1 i size={50}>
                🇺🇦
              </Text>
              <Text h1 i size={30}>
                P2P
              </Text>
            </Row>
          </div>

          <div className={styles.qr}>
            {qr}
            <div className={styles.marquee}>
              <Text i color="grey">
                ключ до блокчейн та грошових переказів
              </Text>
            </div>
          </div>
          <div className={styles.token}>
            <Image
              className={styles.proactive}
              src="/icon.png"
              width="75"
              height="75"
              alt="токен"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
