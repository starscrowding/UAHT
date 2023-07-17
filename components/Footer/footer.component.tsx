import {useEffect} from 'react';
import Script from 'next/script';
import {FaRegQuestionCircle} from 'react-icons/fa';
import {disconnect} from '@wagmi/core';
import {Row, Text, Checkbox} from '@nextui-org/react';
import {CODE, DAO, INFO, FAQ, CONTRACT} from '@space/hooks/api';
import {Info} from '@space/components/Info';
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
        <Text
          h1
          size={16}
          css={{
            textGradient: '45deg, grey 10%, white 90%',
            m: 0,
            fontWeight: 400,
            fontStyle: 'italic',
          }}
        >
          токен без меж для вільних людей
        </Text>
        <Info link={INFO} className={styles.ml05} />
        <Info link={FAQ} className={styles.ml05} icon={<FaRegQuestionCircle color="white" />} />
      </Row>
      <Row justify="center" align="center">
        <a href={DAO} target="_blank" rel="noreferrer" title="DAO">
          <Text color="$gray500">@uaht_group</Text>
        </a>
      </Row>
      <Row justify="center" align="center" className={styles.mt05}>
        <a href={CONTRACT} target="_blank" rel="noreferrer" title="веб 3.0 #DeFI">
          🔱
        </a>
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
                try {
                  disconnect();
                } catch (e) {}
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
