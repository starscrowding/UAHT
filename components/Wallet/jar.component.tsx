import {Row, Button} from '@nextui-org/react';
import {JAR_CONTRACT} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import styles from './wallet.module.scss';

export const Jar = () => {
  return (
    <div>
      <Row className={styles.row} justify="flex-start" align="center" wrap="wrap">
        <Button
          className={styles.button}
          size="sm"
          auto
          flat
          color="success"
          css={{color: 'white'}}
          onClick={() => {
            window.open(
              `https://polygonscan.com/address/${JAR_CONTRACT}#writeContract#F2`,
              '_blank'
            );
          }}
        >
          ✅ Взяти UAHT
        </Button>
        <Info
          className={styles.partner}
          text={
            <>
              📝 Можливість отримати токени під заставу на умовах{' '}
              <a
                href={`https://polygonscan.com/address/${JAR_CONTRACT}#code`}
                target="_blank"
                rel="noreferrer"
              >
                смартконтракту
              </a>
              {'  '}
              👀
              <dl>
                <li>
                  Власник може відкрити / закрити 💸 позику в будь-який час ⌛, надавши дозвіл на
                  використання заставного активу 🔐.
                </li>
              </dl>
            </>
          }
        />
      </Row>
    </div>
  );
};
