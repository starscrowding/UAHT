import {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {useConnector} from '@space/components/Wallet';
import {Row, Card, Button, Input, Spacer, Loading} from '@nextui-org/react';
import {GoVerified, GoUnverified} from 'react-icons/go';
import {IoMdCloseCircleOutline} from 'react-icons/io';
import {api, DAO, DAO_CONTRACT, RESERVE, CONTRACT} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {SignText, Address} from './common';
import {useSign, useUaht, useUahtDao} from './hooks';
import {validateSignature, precision} from './helpers';
import styles from './wallet.module.scss';

export const Dao = ({config}: any) => {
  const MM = useConnector();
  const [account, setAccount] = useState<string>('');
  const [verified, setVerified] = useState<undefined | boolean>();
  const [signature, setSignature] = useState('');
  const uaht = useUaht();
  const uahtDao = useUahtDao();
  const [daoInfo, setDaoInfo] = useState<any>();
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setAccount('');
    setSignature('');
    setDaoInfo(undefined);
  };

  const sign = (t: string) => {
    // eslint-disable-next-line
    useSign({MM, setSignature: (s: string) => setSignature(`${t}+${s}`)})(t);
  };

  const verifyAccount = async (address: string) => {
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

  const getDaoInfo = async (address: string) => {
    if (ethers.utils.isAddress(address)) {
      try {
        const web3Provider = MM.provider;
        const [allowance, balance, gas] = await Promise.all([
          uahtDao.allowance(address),
          uaht.balanceOf(address),
          web3Provider.getBalance(address),
        ]);
        setDaoInfo({allowance, gas, balance});
      } catch (e) {
        setDaoInfo(undefined);
      }
    } else {
      setDaoInfo(undefined);
    }
  };

  const testAccount = async (address: string) => {
    try {
      setLoading(true);
      await Promise.allSettled([verifyAccount(address), getDaoInfo(address)]);
    } finally {
      setLoading(false);
    }
  };

  const doSign = (t?: string) => {
    try {
      const text = prompt('✍️ Підписати: текст', t) || '';
      if (text) {
        sign(text?.replace(/:/gim, ' '));
      } else {
        setSignature('');
      }
    } catch (e) {
      setSignature('');
    }
  };

  const verifySign = () => {
    try {
      const doc = prompt('Перевірити: текст+підпис');
      if (doc) {
        const [body, sign] = doc.split('+') || [];
        const [signature, account] = sign.split('.') || [];
        validateSignature({
          trx: {body, signature},
          setValid: (isTrue: boolean) => {
            alert(isTrue ? '✅' : '❌');
            if (isTrue) {
              setAccount(account);
              testAccount(account);
            }
          },
          account,
        });
      }
    } catch (e) {
      alert('❌');
    }
  };

  useEffect(() => {
    if (config?.sign) {
      doSign(config?.sign);
      setTimeout(() => {
        document?.getElementById('dao')?.scrollIntoView({behavior: 'smooth'});
      }, 3000);
    }
    // eslint-disable-next-line
  }, [config?.sign]);

  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button.Group size="sm" color="gradient" ghost className={styles.button}>
          <Button
            auto
            onClick={() => {
              window.open(`${DAO_CONTRACT}#writeContract#F7`, '_blank');
            }}
          >
            Пропозиція
          </Button>
          <Button
            auto
            onClick={() => {
              window.open(`${DAO_CONTRACT}#writeContract#F10`, '_blank');
            }}
          >
            Голосувати
          </Button>
        </Button.Group>
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
        <Button.Group size="sm" className={styles.button}>
          <Button
            auto
            onClick={() => {
              reset();
              doSign();
            }}
          >
            <SignText />
          </Button>
          <Button
            auto
            onClick={() => {
              reset();
              verifySign();
            }}
            title="Перевірити підпис"
          >
            🧐
          </Button>
        </Button.Group>
      </Row>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Input
          aria-label="address"
          underlined
          color="secondary"
          type="text"
          placeholder="Верифікація адреси"
          width={verified !== undefined && account ? '95px' : '207px'}
          value={account}
          onChange={e => {
            setDaoInfo(undefined);
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
      {signature && (
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <b id="signature">Підпис:&nbsp;</b>
          <Address account={`${signature}.${MM.account}`} />
          <a className={styles.ml05} onClick={() => setSignature('')}>
            <IoMdCloseCircleOutline />
          </a>
        </Row>
      )}
      {loading && !daoInfo && <Loading type="points" />}
      {daoInfo && (
        <Card>
          <Card.Body>
            {daoInfo.balance && (
              <Row>💰 Баланс: {ethers.utils.formatUnits(daoInfo.balance, 2)}</Row>
            )}
            {daoInfo.gas && (
              <Row>⛽ Газ: {precision(ethers.utils.formatEther(daoInfo.gas), 3)}</Row>
            )}
            {daoInfo?.allowance && (
              <Row>🍰 Пай: {ethers.utils.formatUnits(daoInfo.allowance, 2)}</Row>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
