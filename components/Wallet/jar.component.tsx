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
      {...jarContract, functionName: 'free_uaht'},
      {...jarContract, functionName: 'total_asset', args: [USDT_ADDRESS]},
      {...uahtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'allowance', args: [MM.account, JAR_CONTRACT]},
    ],
  }) as any;

  const freeUaht: any = +formatUnits(results?.[0]?.result || 0, 2);
  const totalUsdt: any = +formatUnits(results?.[1]?.result || 0, 6);
  const balanceUaht: any = +formatUnits(results?.[2]?.result || 0, 2);
  const balanceUsdt: any = +formatUnits(results?.[3]?.result || 0, 6);
  const allowanceUsdt: any = +formatUnits(results?.[4]?.result || 0, 6);

  const [selected, setSelected] = useState('UAHT');
  const [usdtValue, setUsdtValue] = useState(0);
  const [uahtValue, setUahtValue] = useState(0);

  const usdtValueDebounced = useDebounce(usdtValue, 1234);
  const uahtValueDebounced = useDebounce(uahtValue, 1234);

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
    usdtValueDebounced && usdtValue === usdtValueDebounced
      ? {
          ...jarContract,
          functionName: 'to_uaht',
          args: [USDT_ADDRESS, usdtValueDebounced * 10 ** 6],
        }
      : {}
  ) as any;

  const {data: simulatedUahtData, config: simulatedUahtConfig} = usePrepareContractWrite(
    usdtValueDebounced && usdtValue === usdtValueDebounced
      ? {
          ...jarContract,
          functionName: 'put',
          args: [USDT_ADDRESS, usdtValueDebounced * 10 ** 6, MM.account],
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
          },
        }
      : {}
  ) as any;

  const {data: simulatedUsdtData, config: simulatedUsdtConfig} = usePrepareContractWrite(
    uahtValueDebounced && uahtValue === uahtValueDebounced
      ? {
          ...jarContract,
          functionName: 'pop',
          args: [USDT_ADDRESS, uahtValueDebounced * 10 ** 2, MM.account],
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

  const toUaht: any = +formatUnits(toUahtData || 0, 2);
  const simulatedUaht: any = +formatUnits(simulatedUahtData?.result || 0, 2);
  const simulatedUsdt: any = +formatUnits(simulatedUsdtData?.result || 0, 6);

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
          value={precision(totalUsdt, 2)}
          onClick={() => setSelected('USDT')}
        />
      </Row>
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
            <div>
              <Text b>{usdtValue} USDT</Text> внесок 📥
            </div>
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
              disabled={!simulatedUaht}
              icon={
                putUahtLoading ? (
                  <Loading color="white" type="points-opacity" size="xs" />
                ) : (
                  undefined
                )
              }
              onClick={() => putUaht?.()}
            >
              Взяти {simulatedUaht || toUaht || ''} UAHT
            </Button>
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
                max: Math.floor(balanceUaht),
                value: uahtValue,
                onChange: setUahtValue,
              }}
            />
            <div>
              <Text b>{uahtValue} UAHT</Text> внесок 📥
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
          </Row>
        </Row>
      )}
    </div>
  );
};
