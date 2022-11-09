import {useEffect} from 'react';
import Script from 'next/script';
import {Row, Text, Checkbox} from '@nextui-org/react';
import {CODE, DAO, INFO} from '@space/hooks/api';
import styles from './footer.module.scss';

export const Footer = () => {
  useEffect(() => {
    const w = window as any;
    w.googLangInit = () => {
      new w.google.translate.TranslateElement(
        {pageLanguage: 'uk', autoDisplay: false},
        'goog_lang_el'
      );
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
        <p className={styles.pointer} title="веб 3.0 #DeFI">
          🔱
        </p>
      </Row>
      <Row justify="space-between" align="center" wrap="wrap" className={styles.mt1}>
        <div id="goog_lang_el" />
        <div className={styles.m05}>
          <Checkbox
            isSelected={true}
            size="xs"
            onChange={value => {
              if (!value) {
                window.location.href = INFO;
              }
            }}
          >
            погоджуюсь з
            <a href={`${CODE}#readme`} target="_blank" rel="noreferrer" title="Статут - Воля 1.0">
              &nbsp;правилами
            </a>
          </Checkbox>
        </div>
      </Row>
      <Script src="//translate.google.com/translate_a/element.js?cb=googLangInit&hl=en" />
    </footer>
  );
};
