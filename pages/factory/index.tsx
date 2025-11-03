import {NextPage} from 'next';
import Head from 'next/head';
import {Container, Row, Col, Loading, Text, Input, Button, Card} from '@nextui-org/react';
import {BASE} from '@space/hooks/api';
import {useConnector, Connect} from '@space/components/Wallet';
import {useState} from 'react';
import Link from 'next/link';
import {usePrepareContractWrite, useContractWrite} from 'wagmi';

import styles from '@space/styles/index.module.scss';

const Factory: NextPage = () => {
  const MM = useConnector();

  const isLoading =
    !MM.status ||
    MM.status === 'reconnecting' ||
    MM.status === 'connecting' ||
    (MM.status === 'connected' && !MM.wallet);

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [image, setImage] = useState('');
  const [supply, setSupply] = useState(0);

  const {config, data: newToken} = usePrepareContractWrite({
    address: '0x7cE2A251759D7095021f2f3e8682c65b73dbD4D1',
    abi: [
      {
        inputs: [
          {internalType: 'string', name: 'name', type: 'string'},
          {internalType: 'string', name: 'symbol', type: 'string'},
          {internalType: 'string', name: 'image', type: 'string'},
          {internalType: 'uint8', name: 'decimals', type: 'uint8'},
          {internalType: 'uint256', name: 'supply', type: 'uint256'},
        ],
        name: 'create',
        outputs: [{internalType: 'address', name: '', type: 'address'}],
        stateMutability: 'nonpayable',
        type: 'function',
        functionName: 'create',
      } as any,
    ],
    functionName: 'create',
    args:
      name && symbol && image && supply ? [name, symbol, image, 18, supply * 10 ** 18] : undefined,
  });
  const {isLoading: isLoadingCreate, write: create} = useContractWrite(config);

  return (
    <>
      <Head>
        <link rel="canonical" href={`${BASE}/factory`} />
        <title>Фабрика токенів | UAHT</title>
        <meta name="description" content="створити власний токен просто" />
      </Head>
      <Container className={styles.container}>
        <Col>
          <main>
            <section>
              <Row justify="flex-end" align="center">
                <Connect />
              </Row>
              <Row
                justify="center"
                align="center"
                gap={4}
                css={{
                  marginLeft: 0,
                  '@smMax': {
                    flexDirection: 'column',
                  },
                }}
              >
                <Text
                  h1
                  size={60}
                  css={{
                    textGradient: '45deg, $blue600 -20%, $pink600 50%',
                    '@smMax': {
                      fontSize: '40px',
                    },
                  }}
                  weight="bold"
                >
                  Фабрика токенів
                </Text>
                <img width={300} src="/meme.png" alt="meme" />
              </Row>
              <Row
                justify="center"
                css={{
                  marginLeft: '0.1rem',
                }}
              >
                {isLoading ? (
                  <Loading type="points" color="secondary" />
                ) : (
                  <Col css={{gap: '1rem', display: 'flex', flexDirection: 'column'}}>
                    <Input
                      width="100%"
                      rounded
                      bordered
                      label="Назва"
                      placeholder="Новий токен"
                      color="success"
                      onChange={e => setName(e?.target?.value)}
                    />
                    <Input
                      width="100%"
                      rounded
                      bordered
                      label="Символ"
                      placeholder="SYMBOL"
                      color="success"
                      onChange={e => setSymbol(e?.target?.value)}
                    />
                    <Input
                      width="100%"
                      rounded
                      bordered
                      label="Логотип"
                      placeholder="Посилання на зображення"
                      color="success"
                      onChange={e => setImage(e?.target?.value)}
                    />
                    <Input
                      type="number"
                      width="100%"
                      rounded
                      bordered
                      label="Кількість"
                      placeholder="Початкова пропозиція"
                      color="success"
                      onChange={e => setSupply(+e?.target?.value)}
                    />
                    <Button
                      css={{marginTop: '1rem'}}
                      size="lg"
                      color="gradient"
                      onClick={() => create?.()}
                      icon={config?.request ? '👍' : undefined}
                    >
                      Створити
                      {isLoadingCreate ? <Loading type="points" /> : undefined}
                    </Button>

                    {newToken?.result ? (
                      <Row css={{gap: 4}}>
                        <div>Адреса токена буде:</div>
                        <Text
                          css={{
                            textGradient: '45deg, $yellow600 -20%, $pink600 100%',
                          }}
                          weight="bold"
                        >
                          {newToken?.result as any}
                        </Text>
                      </Row>
                    ) : null}

                    <Row css={{gap: 10}} wrap="wrap">
                      <Card
                        css={{
                          '@xsMin': {
                            mw: '200px',
                          },
                        }}
                        isHoverable
                      >
                        <Card.Header>
                          <Text h5>Задати ціну 🏷️</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                          <Row>
                            <Link
                              target="_blank"
                              href="https://app.uniswap.org/positions/create/v3?currencyA=0x0d9447e16072b636b4a1e8f2b8c644e58f3eaa6a&chain=polygon&step=0&lng=uk-UA"
                            >
                              <Text b color="#FF4ECD">
                                Uniswap
                              </Text>
                            </Link>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Card
                        css={{
                          '@xsMin': {
                            mw: '200px',
                          },
                        }}
                        isHoverable
                      >
                        <Card.Header>
                          <Text h5>Продати 💰</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                          <Row css={{gap: 10}}>
                            <Link target="_blank" href="https://web3.okx.com/ua/dex-swap">
                              <Text b color="#FF4ECD">
                                OKX
                              </Text>
                            </Link>
                            <Link
                              target="_blank"
                              href="https://app.1inch.io/advanced/limit?network=137"
                            >
                              <Text b color="#FF4ECD">
                                1inch
                              </Text>
                            </Link>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Card
                        css={{
                          '@xsMin': {
                            mw: '200px',
                          },
                        }}
                        isHoverable
                      >
                        <Card.Header>
                          <Text h5>Запит лістингу 📝</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                          <Row css={{gap: 10}}>
                            <Link target="_blank" href="https://t.me/richamster_chat">
                              <Text b color="#FF4ECD">
                                Richamster
                              </Text>
                            </Link>
                            <Link target="_blank" href="https://t.me/occeio">
                              <Text b color="#FF4ECD">
                                OCCE
                              </Text>
                            </Link>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Card
                        css={{
                          '@xsMin': {
                            mw: '200px',
                          },
                        }}
                        isHoverable
                      >
                        <Card.Header>
                          <Text h5>Підтримка 👨‍👦‍👦</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                          <Row>
                            <Link target="_blank" href="https://t.me/uaht_group">
                              <Text b color="#FF4ECD">
                                @uaht_group
                              </Text>
                            </Link>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Row>
                  </Col>
                )}
              </Row>
            </section>
          </main>
        </Col>
      </Container>
    </>
  );
};

export default Factory;
