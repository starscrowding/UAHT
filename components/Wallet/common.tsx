import {ReactElement, useState} from 'react';
import classNames from 'classnames';
import {Row, Button, Text, Modal, Input} from '@nextui-org/react';
import {FaTelegramPlane, FaCopy, FaCheck} from 'react-icons/fa';
import {TELEGRAM} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {MINIMUM} from './constants';
import styles from './wallet.module.scss';

export const IO = ({
  Group,
  I,
  O,
  action,
  balance,
}: {
  Group: ReactElement;
  I: ReactElement;
  O: ReactElement;
  action: string;
  balance: number;
}) => {
  return (
    <div>
      <div className={styles.m1}>{Group}</div>
      {action === 'input' ? <>{I}</> : null}
      {action === 'output' ? (
        <div>
          {balance >= MINIMUM ? (
            <>{O}</>
          ) : (
            <div>Мінімальний вивід {MINIMUM}. Поповни баланс 🤑</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const RequestButton = ({
  disabled,
  to = TELEGRAM,
  onClick,
}: {
  disabled?: boolean;
  to?: string;
  onClick?: () => void;
}) => (
  <Button
    size="sm"
    disabled={disabled}
    icon={<FaTelegramPlane size="21" />}
    onClick={() => {
      if (!onClick && to) {
        window.open(to, '_blank');
      } else {
        onClick?.();
      }
    }}
  >
    Запит {!disabled ? <span className={styles.ml1}>👉</span> : null}
  </Button>
);

export const VerificationModal = ({vModal, setVModal}: any) => {
  return (
    <Modal closeButton aria-labelledby="v-modal" open={!!vModal} onClose={() => setVModal('')}>
      <Modal.Header>
        <Text size={18}>Код згенеровано ✅</Text>
      </Modal.Header>
      <Modal.Body>
        <Row align="center" className={styles.mv1}>
          <RequestButton />
          <Address className={styles.ml1} account={`#${vModal}`} />
          <Info text="Скопіюй та відправ код для початку верифікації 🤝" className={styles.ml1} />
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export const SignText = () => {
  return (
    <>
      <span className={classNames(styles.signText, styles.mr05)}>Підписати</span>✍️
    </>
  );
};

export const Tips = ({
  priority,
  setPriority,
  amount = 0,
  step = '5',
  min = '0',
  disabled = false,
  helperText = 'чай',
  infoText = '👌 чай - винагорода оператору з суми запиту, компенсує газ та визначає пріоритет обробки ⌛',
}: any) => {
  return (
    <>
      <Text color="red" className={styles.ml1}>
        -
      </Text>
      <Input
        aria-label="priority"
        underlined
        color="primary"
        helperText={helperText}
        helperColor="success"
        type="number"
        min={min}
        step={step}
        width="55px"
        value={priority}
        disabled={!amount || disabled}
        onKeyDown={e => {
          if (['-', '+', 'e', 'E', '.'].includes(e?.key)) {
            e?.preventDefault?.();
          }
        }}
        onChange={e => {
          const value = Math.ceil(Math.abs(+e?.target?.value));
          setPriority(value);
        }}
        onBlur={() => {
          if (min > priority) {
            return setPriority(min);
          }
          if (priority > amount) {
            return setPriority(Math.max(min, amount));
          }
        }}
      />
      <Info text={infoText} className={styles.mr1} />
    </>
  );
};

export const Address = ({
  account = '',
  className,
  name,
}: {
  account: string;
  className?: string;
  name?: string;
}) => {
  const [state, setState] = useState('ready');
  return (
    <a
      className={classNames(styles.copy, className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(account);
        } catch (e) {
          prompt('Копіювати:', account);
        } finally {
          setState('done');
          setTimeout(() => setState('ready'), 1234);
        }
      }}
    >
      {state === 'done' ? <FaCheck /> : <FaCopy />}{' '}
      {name || `${account?.slice(0, 4)}...${account?.slice(-4)}`}
    </a>
  );
};
