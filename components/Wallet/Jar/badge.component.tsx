import {Avatar, Badge, Text} from '@nextui-org/react';
import styles from './jar.module.scss';

export const JarBadge = ({selected, asset, value, onClick}: any) => {
  return (
    <a onClick={onClick} className={styles.badge}>
      <Badge
        isSquared
        variant="bordered"
        color={selected ? 'success' : 'default'}
        placement="bottom-right"
        content={<Text size={14}>{value}</Text>}
      >
        <Avatar bordered color={selected ? 'success' : 'default'} size="xl" text={asset} />
      </Badge>
    </a>
  );
};
