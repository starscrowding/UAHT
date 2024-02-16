import {Container, Progress, Row, Button, Text} from '@nextui-org/react';
import {Info} from '@space/components/Info';
import {useConnector} from '@space/components/Wallet';
import {useUahtDaoAllowance, useUahtDaoOperators} from '@uaht/sdk';
import {Address as AddressType, formatUnits} from 'viem';
import {DAO_CONTRACT, JAR_SLOTS} from '@space/hooks/api';
import styles from './wallet.module.scss';

export const Emission = () => {
  const MM = useConnector();
  const {data: pie = 0} = useUahtDaoAllowance({
    args: [MM.account as AddressType],
  });
  const {data: stake = 0} = useUahtDaoOperators({
    args: [MM.account as AddressType],
  });
  const min = 0;
  const max = +formatUnits(pie as bigint, 2);
  const value = +formatUnits(stake as bigint, 2);

  return (
    <Container css={{my: 7, px: 0}}>
      <Row justify="space-between">
        <Row align="center" className={styles.name} css={{width: 'auto'}}>
          <div>♻️ Е-місія</div>
          <Info className={styles.partner} text="⛏️ Децентралізований видобуток спільноти ✨" />
        </Row>
        <Row align="center" css={{width: 'auto', marginRight: '2.3rem'}}>
          <Text
            css={{position: 'relative', top: 10, cursor: 'pointer'}}
            size="$sm"
            title="Операційна частка"
            onClick={() => {
              window.open(`${JAR_SLOTS}/2`, '_blank');
            }}
          >
            🍰 пай: {max} +
          </Text>
        </Row>
      </Row>
      <Row align="center" css={{gap: 4, mt: 5}}>
        <Button
          size="xs"
          auto
          color="success"
          rounded
          flat
          onClick={() => {
            window.open(`${DAO_CONTRACT}#writeContract#F5`, '_blank');
          }}
        >
          +
        </Button>
        <Progress
          size="xs"
          striped
          min={min}
          max={max}
          value={value}
          color="success"
          status="primary"
        />
        <Button
          size="xs"
          auto
          color="primary"
          rounded
          flat
          onClick={() => {
            window.open(`${DAO_CONTRACT}#writeContract#F6`, '_blank');
          }}
        >
          -
        </Button>
      </Row>
    </Container>
  );
};
