import {NextPage} from 'next';
import Head from 'next/head';
import {Container, Row, Col, Loading} from '@nextui-org/react';
import {FaEyeSlash} from 'react-icons/fa';
import {BASE} from '@space/hooks/api';
import {Presentation} from '@space/components/Presentation';
import {Wallet, useConnector, Connect} from '@space/components/Wallet';
import {Footer} from '@space/components/Footer';
import {useState} from 'react';
import {clsx} from 'clsx';
import styles from '../styles/index.module.scss';

const Home: NextPage = () => {
  const MM = useConnector();
  const [eyeSlash, setEyeSlash] = useState(false);

  const isLoading =
    !MM.status ||
    MM.status === 'reconnecting' ||
    MM.status === 'connecting' ||
    (MM.status === 'connected' && !MM.wallet);

  return (
    <>
      <Head>
        <link rel="canonical" href={BASE} />
        <title>UAHT</title>
        <meta name="description" content="токен без меж для вільних людей" />
      </Head>
      <Container className={clsx(styles.container, {eyeSlash})}>
        <Col>
          <main>
            <section>
              <Row justify="flex-end" align="center" css={{gap: '1rem'}}>
                <FaEyeSlash
                  style={{cursor: 'pointer'}}
                  size={21}
                  color={eyeSlash ? 'white' : 'gray'}
                  onClick={() => setEyeSlash(!eyeSlash)}
                />
                <Connect />
              </Row>
              <Row
                justify="center"
                align="center"
                css={isLoading ? {minHeight: '100vh'} : {minHeight: '50vh'}}
              >
                {isLoading ? (
                  <Loading type="points" />
                ) : MM.status === 'connected' ? (
                  <Wallet />
                ) : (
                  <Presentation />
                )}
              </Row>
            </section>
          </main>
          <Footer />
        </Col>
      </Container>
    </>
  );
};

export default Home;
