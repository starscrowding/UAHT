import {useEffect, useState, useMemo} from 'react';
import {NextPage, NextPageContext} from 'next';
import Router from 'next/router';
import {Container, Row, Spacer, Card, Button, Input, Text} from '@nextui-org/react';
import {ethers} from 'ethers';
import {isAdmin} from '@space/hooks/route';
import {RESOURCES, PROVIDERS} from '@space/components/Wallet/constants';
import {CONTRACT, DAO_CONTRACT, RESERVE_URL} from '@space/hooks/api';
import styles from '../styles/variables.module.scss';

export const parseCode = (code: string = '') => {
  try {
    const body = atob(code.split('.')[0]);
    const signature = code.split('.')[1];
    const [priority, stamp, type, source, value, account, payload] = body.split(':');
    return {
      priority,
      stamp,
      type,
      source,
      value,
      account,
      payload,
      body,
      signature,
    };
  } catch {
    return {
      error: 'Invalid code',
    };
  }
};

const Admin: NextPage = ({admin}: any) => {
  const [hash, setHash] = useState('');
  const [code, setCode] = useState('');
  const [validSignature, setValidSignature] = useState(false);

  const trx = useMemo(() => {
    setValidSignature(false);
    return parseCode(code);
  }, [code]);
  const source = useMemo(() => {
    if (trx && trx.source) {
      return RESOURCES[trx.source] || PROVIDERS[trx.source];
    }
  }, [trx]);
  const expired = useMemo(() => {
    return trx?.type !== 'v'
      ? trx?.stamp?.slice(0, 4) !==
          Date.now()
            .toString()
            .slice(0, 4)
      : false;
  }, [trx]);

  useEffect(() => {
    const hash = window?.location?.hash;
    if (hash) {
      setHash(hash.substring(1));
    }
  }, []);

  useEffect(() => {
    const validateSignature = async () => {
      try {
        if (trx.body && trx.signature) {
          const signer = await ethers.utils.verifyMessage(trx.body, trx.signature);
          if (trx.account && signer) {
            setValidSignature(trx.account?.toLowerCase() === signer.toLowerCase());
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    validateSignature();
  }, [trx, setValidSignature]);

  if (!admin) {
    Router.replace('/login');
    return null;
  }

  return (
    <Container>
      <Row className={styles.mv1} justify="space-evenly">
        <a href={RESERVE_URL} target="_blank" rel="noreferrer">
          Резерв
        </a>
        <a href={`${CONTRACT}#readContract`} target="_blank" rel="noreferrer">
          UAHT
        </a>
        <a href={`${DAO_CONTRACT}#readContract`} target="_blank" rel="noreferrer">
          UAHT_DAO
        </a>
      </Row>
      <Spacer />
      <Card>
        <Input
          placeholder="Код"
          onChange={e => {
            const codeValue = e?.target?.value || '';
            setCode(codeValue.startsWith('#') ? codeValue.slice(1) : codeValue);
          }}
        />
      </Card>
      {code && trx ? (
        <div>
          <pre>{JSON.stringify(trx, null, 2)}</pre>
          {expired ? (
            <Text color="error">Штамп недійсний</Text>
          ) : (
            <>
              <Row align="center">
                <Text color="green">чай</Text>&nbsp;{trx.priority}
              </Row>
              {trx.type === 'v' ? (
                <>
                  {validSignature ? (
                    <Text color="success">Підпис дійсний</Text>
                  ) : (
                    <Text color="error">Підпис недійсний</Text>
                  )}
                </>
              ) : null}
              {trx.type === 'i' ? (
                <Row align="center" wrap="wrap">
                  <Button className={styles.m1} as="a" target="_blank" href={source?.help}>
                    Ввід - {trx.source}
                  </Button>
                  <Button
                    className={styles.m1}
                    as="a"
                    target="_blank"
                    href={`${DAO_CONTRACT}#writeContract#F3`}
                  >
                    {`UAHT_DAO.input(UAH * 100)`}
                  </Button>
                </Row>
              ) : null}
              {trx.type === 'o' ? (
                <>
                  {validSignature ? (
                    <Row align="center" wrap="wrap">
                      <Button
                        className={styles.m1}
                        as="a"
                        target="_blank"
                        href={`${DAO_CONTRACT}#writeContract#F4`}
                      >
                        {`UAHT_DAO.output(${+trx.value * 100})`}
                      </Button>
                      <Button className={styles.m1} as="a" target="_blank" href={source?.help}>
                        Вивід - {trx.source}({+trx.value})
                      </Button>
                    </Row>
                  ) : (
                    <Text color="error">Підпис недійсний</Text>
                  )}
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </Container>
  );
};

export async function getServerSideProps(ctx: NextPageContext) {
  const admin = isAdmin({ctx});
  return {props: {admin}};
}

export default Admin;
