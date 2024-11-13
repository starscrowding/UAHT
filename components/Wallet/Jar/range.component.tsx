import {Row, Text, Input} from '@nextui-org/react';
import {sanitizeInput} from '../helpers';
import styles from './jar.module.scss';

export const JarRange = ({min = 0, max, value, onChange, disabled}: any) => {
  return (
    <Row className={styles.range} align="center" css={{gap: '0.5rem'}}>
      <Text small color="grey">
        {min}
      </Text>
      <input
        style={{width: 'min(100%, 350px)'}}
        type="range"
        min={min}
        max={max}
        value={value || 0}
        disabled={disabled}
        onChange={e => onChange(Number(e?.target.value))}
      />
      <Text small color="grey">
        {max}
      </Text>
    </Row>
  );
};

export const JarRangeInput = ({min = 0, max, value, onChange, disabled}: any) => {
  return (
    <Input
      aria-label="range"
      type="tel"
      css={{
        input: {
          fontWeight: 'bold',
          textAlign: 'right',
        },
        width: 75,
      }}
      underlined
      min={min}
      max={max}
      disabled={disabled}
      value={value || ''}
      onKeyDown={sanitizeInput}
      onChange={e => onChange(Math.max(min, Math.min(Number(e?.target.value), max)))}
    />
  );
};
