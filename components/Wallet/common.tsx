import {ReactElement} from 'react';
import {Card, Row, Button, Container, Text, Modal} from '@nextui-org/react';
import {FaTelegramPlane} from 'react-icons/fa';
import {TELEGRAM} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {POLYGON, Address} from '../Metamask';
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

export const RequestButton = ({disabled}: {disabled?: boolean; to?: string}) => (
  <Button
    size="sm"
    disabled={disabled}
    icon={<FaTelegramPlane size="21" />}
    onClick={() => {
      window.open(TELEGRAM, '_blank');
    }}
  >
    Запит {!disabled ? <span className={styles.ml1}>👉</span> : null}
  </Button>
);

export const Empty = ({MM}: any) => {
  return (
    <Card className={styles.wallet}>
      <Container>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          Для користування треба активація мережі Polygon
        </Row>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <Button className={styles.button} size="sm" auto onClick={() => MM.addChain(POLYGON)}>
            Додати Polygon
          </Button>
        </Row>
      </Container>
    </Card>
  );
};

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
          <Info text="Скопіюй та відправ код для початку веріфікації 🤝" className={styles.ml1} />
        </Row>
      </Modal.Body>
    </Modal>
  );
};
