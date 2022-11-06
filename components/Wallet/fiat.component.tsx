import {Row, Button, Input, Radio} from '@nextui-org/react';
import {Info} from '@space/components/Info';
import {Address} from '../Metamask';
import {PROVIDERS} from './constants';
import {createCode} from './helpers';
import {IO, RequestButton} from './common';
import styles from './wallet.module.scss';

export const Fiat = ({
  action,
  balance,
  provider,
  setProvider,
  reserve,
  MM,
  signature,
  id,
  validateId,
  amount,
  setAmount,
  onAmountChange,
  priority,
  stamp,
  sign,
}: any) => {
  return (
    <IO
      action={action}
      balance={balance}
      Group={
        <Radio.Group
          className={styles.radio}
          label="Обери джерело:"
          orientation="horizontal"
          size="sm"
          value={provider}
          onChange={value => setProvider(value)}
        >
          {Object.keys(PROVIDERS).map((key: string) => (
            <Radio
              key={key}
              value={key}
              description={reserve ? <span title={`Резерв ${key}`}>{reserve[key]}</span> : '-'}
            >
              {PROVIDERS[key]?.text}
            </Radio>
          ))}
        </Radio.Group>
      }
      I={
        <div>
          <Row>
            <span>ID переказу:</span>
            {provider ? (
              <>
                <Address className={styles.ml1} account={PROVIDERS[provider]?.id} />
                <Info className={styles.ml1} link={PROVIDERS[provider]?.help} />
              </>
            ) : (
              <div className={styles.ml1}>👆</div>
            )}
          </Row>
          <Row>
            <span>Призначення:</span>
            <Address className={styles.ml1} account={`${MM.account}`} />
            <Info className={styles.ml1} text="Статутний внесок" />
          </Row>
          <Row align="center" className={styles.mt05}>
            <RequestButton disabled={!provider} />
            {provider ? <Info text="Повідом про переказ 🤝" className={styles.ml1} /> : null}
          </Row>
        </div>
      }
      O={
        <div>
          <Row className={styles.mv1} align="center">
            <Input
              underlined
              color="secondary"
              placeholder={`${PROVIDERS[provider]?.text || ''} ID`}
              width="100px"
              disabled={!!signature || !provider}
              value={id}
              onChange={e => validateId(e?.target?.value)}
            />
            <Input
              underlined
              color="secondary"
              type="number"
              placeholder="Сума"
              width="100px"
              disabled={!!signature}
              value={amount}
              onChange={e => {
                setAmount(e?.target?.value);
              }}
              onBlur={() => onAmountChange(amount)}
            />
            <Button
              className={styles.button}
              size="sm"
              auto
              disabled={!provider || !id || !!signature || amount > reserve[provider]}
              onClick={() =>
                sign(
                  createCode({
                    priority,
                    stamp,
                    type: 'o',
                    source: provider,
                    value: amount?.toString(),
                    account: MM.account,
                    payload: id,
                    encode: false,
                  })
                )
              }
            >
              Підписати
            </Button>
          </Row>
          <Row align="center" className={styles.mt05}>
            <RequestButton disabled={!provider || !signature} />
            {provider && signature ? (
              <>
                <Address
                  className={styles.ml1}
                  account={createCode({
                    priority,
                    stamp,
                    type: 'o',
                    source: provider,
                    value: amount?.toString(),
                    account: MM.account,
                    payload: id,
                    signature,
                  })}
                />
                <Info text="Скопіюй та відправ код запиту для виводу 🤝" className={styles.ml1} />
              </>
            ) : null}
          </Row>
        </div>
      }
    />
  );
};
