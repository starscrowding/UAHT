import {useState} from 'react';
import {ethers} from 'ethers';
import {useConnector} from '@space/components/Wallet';
import {Row, Button, Input, Spacer} from '@nextui-org/react';
import {GoVerified, GoUnverified} from 'react-icons/go';
import {api, DAO, DAO_CONTRACT, RESERVE, CONTRACT} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {SignText} from './common';
import {useSign} from './hooks';
import styles from './wallet.module.scss';
import {Address} from '../Metamask';

export const Dao = () => {
  const MM = useConnector();
  const [account, setAccount] = useState<string>('');
  const [verified, setVerified] = useState<undefined | boolean>();
  const [signature, setSignature] = useState('');

  const sign = useSign({MM, setSignature});

  const testAccount = async (address: string) => {
    if (ethers.utils.isAddress(address)) {
      try {
        const row = await api(RESERVE);
        const kyc = new RegExp(address, 'mig').test(row?.files?.['x.DAO']?.content);
        setVerified(!!kyc);
      } catch (e) {
        setVerified(undefined);
      }
    } else {
      setVerified(undefined);
    }
  };

  const doSign = () => {
    try {
      const text = prompt('Що підписуємо?') || '';
      if (text) {
        sign(text?.replace(/:/gim, ' '));
      } else {
        setSignature('');
      }
    } catch (e) {
      setSignature('');
    }
  };

  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Input
          aria-label="address"
          underlined
          color="secondary"
          type="text"
          placeholder="Верифікація гаманця"
          width={verified !== undefined && account ? '123px' : '200px'}
          onChange={e => {
            setAccount(e?.target?.value || '');
            testAccount(e?.target?.value || '');
          }}
        />
        {verified !== undefined && account ? (
          <a
            href={`${CONTRACT}?a=${account}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ml05}
          >
            polygonscan↗
          </a>
        ) : (
          undefined
        )}
        <div className={styles.mh1}>
          {verified === undefined && <GoUnverified title="Перевірити адресу" />}
          {verified === true && <GoVerified title="Верифіковано" color="green" />}
          {verified === false && <GoVerified title="Не верифіковано" color="gray" />}
        </div>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(`https://amlbot.com/ua`, '_blank');
          }}
        >
          AML перевірка
        </Button>
      </Row>
      <Spacer />
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(`${DAO_CONTRACT}#writeContract#F7`, '_blank');
          }}
        >
          Пропозиція
        </Button>
        <Button
          className={styles.button}
          size="sm"
          auto
          onClick={() => {
            window.open(`${DAO_CONTRACT}#writeContract#F10`, '_blank');
          }}
        >
          Голосувати
        </Button>
        <Info
          text={
            <>
              id повідомлення{' '}
              <a href={DAO} target="_blank" rel="noreferrer">
                @uaht_group
              </a>
            </>
          }
          className={styles.mh05}
        />
        <Button className={styles.button} size="sm" auto onClick={() => doSign()}>
          <SignText />
        </Button>
      </Row>
      {signature && (
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <Address account={`${signature}.${MM.account}`} />
        </Row>
      )}
    </div>
  );
};
