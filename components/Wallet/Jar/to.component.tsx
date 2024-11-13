import {Input} from '@nextui-org/react';
import styles from './jar.module.scss';

export const JarTo = ({to}: any) => {
  return (
    <Input
      aria-label="to"
      underlined
      color="success"
      labelLeft="💳"
      placeholder="Отримувач"
      width="min(100%, 400px)"
      css={{
        input: {
          fontSize: 'smaller',
        },
      }}
      value={to}
    />
  );
};
