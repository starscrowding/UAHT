import {NextPage} from 'next';
import Head from 'next/head';
import {Container, Row, Col, Text} from '@nextui-org/react';
import {BASE} from '@space/hooks/api';
import {Logo} from '@space/components/Logo';
import styles from '../styles/home.module.scss';

const Home: NextPage = () => {
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
              <Row justify="center" align="center">
                <Logo />
              </Row>
              <Row justify="center" align="center">
                <Text h6 size={17} color="white" css={{m: 0}}>
                  токен без меж для вільних людей
                </Text>
              </Row>
            </section>
          </main>
          <footer className={styles.footer}>
            <Row justify="center" align="center">
              <a title="воля">🔱</a>
            </Row>
          </footer>
        </Col>
      </Container>
    </>
  );
};

export default Home;
