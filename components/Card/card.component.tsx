import {Card as NextCard} from '@nextui-org/react';
import classNames from 'classnames';
import {Logo} from '@space/components/Logo';
import styles from './card.module.scss';

export const Card = ({className, info, data}: any) => {
  return (
    <NextCard className={classNames(styles.card, className)}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.info}>{info}</div>
      <div className={styles.data}>{data}</div>
    </NextCard>
  );
};
