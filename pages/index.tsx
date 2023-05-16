import {NextPage} from 'next';
import Head from 'next/head';
import {Container, Row, Col, Text, Loading} from '@nextui-org/react';
import {FaRegQuestionCircle} from 'react-icons/fa';
import {BASE, CONTRACT, INFO, FAQ} from '@space/hooks/api';
import {Logo} from '@space/components/Logo';
import {Presentation} from '@space/components/Presentation';
import {Wallet, useConnector, Connect} from '@space/components/Wallet';
import {Info} from '@space/components/Info';
import {Footer} from '@space/components/Footer';
import styles from '../styles/index.module.scss';

const Home: NextPage = () => {
  const MM = useConnector();

  return (
    <>
      <Head>
        <link rel="canonical" href={BASE} />
        <title>UAHT</title>
        <meta name="description" content="токен без меж для вільних людей" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇺🇦</text></svg>"
        />
      </Head>
      <Container className={styles.container}>
        <Col>
          <main>
            <section>
              <Row justify="flex-end" align="center">
                <Connect />
              </Row>
              {MM.status !== 'connected' && (
                <>
                  <Row justify="center" align="center">
                    <Logo href={CONTRACT} target="_blank" />
                    <a
                      className={styles.ml05}
                      href={FAQ}
                      target="_blank"
                      rel="noreferrer"
                      title="Часті питання | FAQ"
                    >
                      <FaRegQuestionCircle color="white" size={18} />
                    </a>
                  </Row>
                  <Row justify="center" align="center">
                    <Text h6 size={17} color="white" css={{m: 0}}>
                      токен без меж для вільних людей
                    </Text>
                    <Info link={INFO} className={styles.ml05} />
                  </Row>
                </>
              )}
              <Row justify="center" align="center" css={{minHeight: '250px'}}>
                {!MM.status ||
                MM.status === 'reconnecting' ||
                MM.status === 'connecting' ||
                (MM.status === 'connected' && !MM.signer) ? (
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
