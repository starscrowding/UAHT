import {useEffect, useState, useMemo} from 'react';
import {NextPage} from 'next';
import {ethers} from 'ethers';
import UAHT_DAO_ABI from '@space/contracts/UAHT_DAO.abi.json';
import {Container, Row, Spacer, Card, Button, Input, Text} from '@nextui-org/react';
import {useConnector} from '@space/components/Wallet';
import {RESOURCES, PROVIDERS} from '@space/components/Wallet/constants';
import {MetamaskStatus} from '@space/components/Metamask';
import {parseCode, validateSignature} from '@space/components/Wallet/helpers';
import {CONTRACT, DAO_CONTRACT, DAO_ADDRESS, RESERVE_URL} from '@space/hooks/api';
import styles from '../styles/index.module.scss';

const Operator: NextPage = () => {
  const MM = useConnector();
  const [isOperator, setIsOperator] = useState(false);
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
    if (MM.status === 'connected') {
      const checkOperator = async () => {
        const web3Provider = new ethers.providers.Web3Provider(MM.ethereum);
        const uahtDao = new ethers.Contract(DAO_ADDRESS, UAHT_DAO_ABI, web3Provider);
        try {
          const op = await uahtDao.operators(MM.account);
          const isOp = !op?.isZero();
          console.log(isOp);
          setIsOperator(!!isOp);
        } catch (e) {
          console.log(e);
        }
      };
      checkOperator();
    }
  }, [MM]);

  useEffect(() => {
    validateSignature({trx, setValid: setValidSignature});
  }, [trx, setValidSignature]);

  return (
    <Container className={styles.container}>
      <Row justify="flex-end" align="center">
        <MetamaskStatus />
        <div className={styles.metamask} title="MetaMask" />
      </Row>
      {!isOperator || MM.status !== 'connected' ? (
        <Row justify="center" align="center" className={styles.m1}>
          👋
        </Row>
      ) : (
        <>
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
                        href={`${DAO_CONTRACT}#writeContract#F5`}
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
                            href={`${DAO_CONTRACT}#writeContract#F6`}
                          >
                            {`UAHT_DAO.output(${+trx.value * 100})`}
                          </Button>
                          <Button className={styles.m1} as="a" target="_blank" href={source?.help}>
                            Вивід - {trx.source}({+trx.value - (+trx.priority || 0)})
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
        </>
      )}
    </Container>
  );
};

export default Operator;
