import {ethers} from 'ethers';
import {useEffect, useState} from 'react';
import {Card, Row, Text, Button, Collapse} from '@nextui-org/react';
import {useConnectedMetaMask} from 'metamask-react';
import UAHT_ABI from '@space/contracts/UAHT.abi.json';
import {ADDRESS} from '@space/hooks/api';
import {POLYGON_ID, POLYGON} from '../Metamask';
import styles from './wallet.module.scss';

export const Wallet = () => {
  const MM = useConnectedMetaMask();
  const [balance, setBalance] = useState(0);

  const addToken = async () => {
    try {
      await MM.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: ADDRESS,
            symbol: 'UAHT',
            decimals: 2,
            image: 'https://uaht.io/icon.png',
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const balanceOf = async () => {
      const provider = new ethers.providers.Web3Provider(MM.ethereum);
      const uaht = new ethers.Contract(ADDRESS, UAHT_ABI, provider);
      try {
        const balance = await uaht.balanceOf(MM.account);
        setBalance(balance?.toNumber() / 100);
      } catch (e) {
        console.log(e);
      }
    };
    balanceOf();
  }, [MM]);

  if (MM.chainId !== POLYGON_ID) {
    return (
      <Card className={styles.wallet}>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          Для користування треба активація мережі Polygon
        </Row>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <Button className={styles.button} size="sm" auto onClick={() => MM.addChain(POLYGON)}>
            Додати Polygon
          </Button>
        </Row>
      </Card>
    );
  }

  return (
    <Card className={styles.wallet}>
      <Collapse.Group>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <div className={styles.name}>Гаманець:</div>
          <div className={styles.address}>
            <Text>{MM.account}</Text>
          </div>
        </Row>
        <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
          <div className={styles.name}>Баланс:</div>
          <div>{balance ?? '-'}</div>
        </Row>
        <Collapse
          expanded
          title={<div className={styles.name}>Адреса токена:</div>}
          subtitle={
            <div className={styles.address}>
              <Text
                css={{
                  textGradient: '45deg, $yellow600 10%, $blue600 50%',
                }}
              >
                {ADDRESS}
              </Text>
            </div>
          }
        >
          <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
            <Button className={styles.button} size="sm" auto onClick={() => addToken()}>
              Додати в Metamask
            </Button>
            <Button
              className={styles.button}
              size="sm"
              color="gradient"
              auto
              onClick={() => {
                window.open('https://app.uniswap.org/#/swap?chain=polygon', '_blank');
              }}
            >
              Обміняти на Uniswap
            </Button>
          </Row>
        </Collapse>
      </Collapse.Group>
    </Card>
  );
};
