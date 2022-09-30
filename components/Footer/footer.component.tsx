import {useEffect} from 'react';
import Script from 'next/script';
import {Row, Text} from '@nextui-org/react';
import {CODE, DAO} from '@space/hooks/api';
import styles from './footer.module.scss';

export const Footer = () => {
  useEffect(() => {
    const w = window as any;
    w.googLangInit = () => {
      new w.google.translate.TranslateElement({pageLanguage: 'uk'}, 'goog_lang_el');
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <Row justify="center" align="center">
        <a href={DAO} target="_blank" rel="noreferrer" title="DAO">
          <Text color="$gray500">@uaht_group</Text>
        </a>
      </Row>
      <Row justify="center" align="center" className={styles.mt05}>
        <a href={`${CODE}#readme`} target="_blank" rel="noreferrer" title="Статут - Воля 1.0">
          🔱
        </a>
      </Row>
      <Row justify="flex-start" align="center" className={styles.mt1}>
        <div id="goog_lang_el" />
      </Row>
      <Script src="//translate.google.com/translate_a/element.js?cb=googLangInit&hl=en" />
    </footer>
  );
};
