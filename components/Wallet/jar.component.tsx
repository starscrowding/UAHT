import {Row, Button, Text, Input, Loading, Card} from '@nextui-org/react';
import {JAR_CONTRACT, USDT_ADDRESS, ADDRESS} from '@space/hooks/api';
import {Info} from '@space/components/Info';
import {useConnector} from '@space/components/Wallet';
import UAHT_JAR_ABI from '@space/contracts/UAHT_JAR.abi.json';
import ERC20_ABI from '@space/contracts/ERC20.abi.json';
import {useContractWrite, usePrepareContractWrite, useContractReads, useContractRead} from 'wagmi';
import {formatUnits} from 'viem';
import {useState} from 'react';
import {useDebounce} from '@space/hooks/helpers';
import {precision} from './helpers';
import {JarBadge, JarRange} from './Jar';
import styles from './wallet.module.scss';

const jarContract = {
  address: JAR_CONTRACT,
  abi: UAHT_JAR_ABI as any,
} as const;

const uahtContract = {
  address: ADDRESS,
  abi: ERC20_ABI as any,
} as const;

const usdtContract = {
  address: USDT_ADDRESS,
  abi: ERC20_ABI as any,
} as const;

export const Jar = () => {
  const MM = useConnector();
  const {data: results} = useContractReads({
    watch: true,
    contracts: [
      {
        ...jarContract,
        functionName: 'position',
        args: [MM.account],
      },
      {...jarContract, functionName: 'free_uaht'},
      {...jarContract, functionName: 'free_asset', args: [USDT_ADDRESS]},
      {...uahtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'allowance', args: [MM.account, JAR_CONTRACT]},
    ],
  }) as any;

  const position: any = results?.[0]?.result || [];
  const stake: any = +formatUnits(position[3] || 0, 6);
  const debt: any = +formatUnits(position[4] || 0, 2);
  const end: any = Number(position[5] || 0) * 1000;
  const hasPosition = debt > 0;
  const freeUaht: any = +formatUnits(results?.[1]?.result || 0, 2);
  const balanceUaht: any = +formatUnits(results?.[3]?.result || 0, 2);
  const balanceUsdt: any = +formatUnits(results?.[4]?.result || 0, 6);
  const allowanceUsdt: any = +formatUnits(results?.[5]?.result || 0, 6);

  const {data: simulation} = usePrepareContractWrite({
    ...jarContract,
    functionName: 'simulate_free_asset',
    args: [USDT_ADDRESS],
    scopeKey: freeUaht,
  }) as any;

  const freeUsdt: any = +formatUnits(simulation?.result || results?.[2]?.result || 0, 6);

  const [selected, setSelected] = useState('UAHT');
  const [usdtValue, setUsdtValue] = useState(0);
  const [uahtValue, setUahtValue] = useState(0);
  const [days, setDays] = useState(0);

  const usdtValueDebounced = useDebounce(usdtValue, 1234);
  const uahtValueDebounced = useDebounce(uahtValue, 1234);
  const daysDebounced = useDebounce(days, 1234);

  const {write: approveUsdt, isLoading: approveUsdtLoading} = useContractWrite(
    usdtValueDebounced && usdtValue === usdtValueDebounced
      ? {
          ...usdtContract,
          functionName: 'approve',
          args: [JAR_CONTRACT, usdtValueDebounced * 10 ** 6],
        }
      : {}
  ) as any;

  const {data: toUahtData} = useContractRead(
    usdtValueDebounced && usdtValue === usdtValueDebounced && days === daysDebounced
      ? {
          ...jarContract,
          functionName: 'to_uaht',
          args: [USDT_ADDRESS, usdtValueDebounced * 10 ** 6, daysDebounced],
        }
      : {}
  ) as any;

  const {data: simulatedUahtData, config: simulatedUahtConfig} = usePrepareContractWrite(
    usdtValueDebounced && usdtValue === usdtValueDebounced && days === daysDebounced
      ? {
          ...jarContract,
          functionName: 'put',
          args: [USDT_ADDRESS, usdtValueDebounced * 10 ** 6, daysDebounced],
          scopeKey: allowanceUsdt,
        }
      : {}
  ) as any;

  const {write: putUaht, isLoading: putUahtLoading} = useContractWrite(
    simulatedUahtConfig?.request
      ? {
          ...simulatedUahtConfig,
          onSuccess: () => {
            setUsdtValue(0);
            setDays(0);
          },
        }
      : {}
  ) as any;

  const {data: simulatedUsdtData, config: simulatedUsdtConfig} = usePrepareContractWrite(
    hasPosition || (uahtValueDebounced && uahtValue === uahtValueDebounced)
      ? {
          ...jarContract,
          functionName: 'pop',
          args: [
            USDT_ADDRESS,
            hasPosition ? debt * 10 ** 2 : uahtValueDebounced * 10 ** 2,
            MM.account,
          ],
        }
      : {}
  ) as any;

  const {write: popUsdt, isLoading: popUsdtLoading} = useContractWrite(
    simulatedUsdtConfig?.request
      ? {
          ...simulatedUsdtConfig,
          onSuccess: () => {
            setUahtValue(0);
          },
        }
      : {}
  ) as any;

  const simulatedUaht: any = +formatUnits(simulatedUahtData?.result || 0, 2);
  const simulatedUsdt: any = +formatUnits(simulatedUsdtData?.result || 0, 6);
  const toUaht: any = +formatUnits(toUahtData || 0, 2);

  return (
    <div>
      <Row
        css={{
          gap: '5rem',
          paddingBottom: '2rem',
        }}
      >
        <JarBadge
          asset="UAHT"
          selected={selected === 'UAHT'}
          value={freeUaht}
          onClick={() => setSelected('UAHT')}
        />
        <JarBadge
          asset="USDT"
          selected={selected === 'USDT'}
          value={precision(freeUsdt, 2)}
          onClick={() => setSelected('USDT')}
        />
      </Row>
      {hasPosition ? (
        <Card
          className="proactive"
          isPressable
          isHoverable
          css={{gap: '1rem', marginBottom: '2rem', p: '1rem'}}
        >
          <Row justify="space-between" wrap="wrap" css={{gap: '1rem'}}>
            <div>
              💸 Борг: <b>{debt} UAHT</b>
            </div>
            <div>
              🔐 Застава: <b>{stake} USDT</b>
            </div>
          </Row>
        </Card>
      ) : null}
      {selected === 'UAHT' ? (
        <Row
          className={styles.row}
          css={{
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{width: '100%'}}>
            <JarRange
              {...{min: 0, max: Math.floor(balanceUsdt), value: usdtValue, onChange: setUsdtValue}}
            />

            {hasPosition ? (
              <div>
                <Text b>{usdtValue} USDT</Text> додаткова застава 🔐
              </div>
            ) : (
              <div>
                <Text b>{usdtValue} USDT</Text> застава 🔐
              </div>
            )}
          </div>
          <div style={{width: '100%'}}>
            {hasPosition ? (
              <div>
                термін до{' '}
                <Text i b>
                  {new Date(end).toLocaleDateString('uk')}
                </Text>{' '}
                ⏳
              </div>
            ) : (
              <div>
                <JarRange {...{min: 0, max: 365, value: days, onChange: setDays}} />
                <div>
                  термін днів <Text b>{days}</Text> до{' '}
                  <Text i>{new Date(Date.now() + days * 86400000).toLocaleDateString('uk')}</Text>{' '}
                  ⏳
                </div>
              </div>
            )}
          </div>
          <Row align="center">
            {allowanceUsdt < usdtValue ? (
              <Button
                className={styles.button}
                size="sm"
                auto
                icon={
                  approveUsdtLoading ? (
                    <Loading color="white" type="points-opacity" size="xs" />
                  ) : (
                    undefined
                  )
                }
                onClick={() => approveUsdt?.()}
              >
                Дозволити {usdtValue || ''} USDT
              </Button>
            ) : null}
            <Button
              className={styles.button}
              size="sm"
              auto
              bordered
              color="success"
              css={{color: 'white'}}
              disabled={!simulatedUahtConfig?.request}
              icon={
                putUahtLoading ? (
                  <Loading color="white" type="points-opacity" size="xs" />
                ) : (
                  undefined
                )
              }
              onClick={() => putUaht?.()}
            >
              Взяти {Boolean(usdtValue && !simulatedUaht && toUaht) && '~'}
              {simulatedUaht || toUaht || ''} UAHT
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
                      Власник може відкрити / закрити 💸 позику в будь-який час ⌛, надавши дозвіл
                      на використання заставного активу 🔐.
                    </li>
                  </dl>
                </>
              }
            />
          </Row>
        </Row>
      ) : (
        <Row
          className={styles.row}
          css={{
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{width: '100%'}}>
            <JarRange
              {...{
                min: 0,
                max: hasPosition ? debt : Math.floor(balanceUaht),
                value: hasPosition ? debt : uahtValue,
                onChange: hasPosition ? () => {} : setUahtValue,
              }}
            />
            <div>
              <Text b>{hasPosition ? debt : uahtValue} UAHT</Text> внесок
            </div>
          </div>
          <Row>
            <Input
              underlined
              color="success"
              labelLeft="💳"
              placeholder="Отримувач"
              width="min(100%, 400px)"
              css={{
                input: {
                  fontSize: 'smaller',
                },
              }}
              value={MM.account}
            />
          </Row>
          <Row align="center">
            <Button
              className={styles.button}
              size="sm"
              auto
              bordered
              color="success"
              css={{color: 'white'}}
              disabled={!simulatedUsdt}
              icon={
                popUsdtLoading ? (
                  <Loading color="white" type="points-opacity" size="xs" />
                ) : (
                  undefined
                )
              }
              onClick={() => popUsdt?.()}
            >
              Взяти {precision(simulatedUsdt, 2) || ''} USDT
            </Button>
            <Info
              className={styles.partner}
              text={
                <>
                  📝 Можливість отримати токени на умовах{' '}
                  <a
                    href={`https://polygonscan.com/address/${JAR_CONTRACT}#code`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    смартконтракту
                  </a>
                  {'  '}
                  👀
                </>
              }
            />
          </Row>
        </Row>
      )}
    </div>
  );
};
