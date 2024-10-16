import {Row, Text} from '@nextui-org/react';
import styles from './jar.module.scss';

export const JarRange = ({min, max, value, onChange, disabled}: any) => {
  return (
    <Row className={styles.range} align="center" css={{gap: '0.5rem'}}>
      <Text small color="grey">
        {min}
      </Text>
      <input
        style={{width: 'min(100%, 350px)'}}
        type="range"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e?.target.value))}
      />
      <Text small color="grey">
        {max}
      </Text>
    </Row>
  );
};
