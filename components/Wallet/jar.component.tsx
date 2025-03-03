import {Row, Button, Text, Loading} from '@nextui-org/react';
import {JAR_CONTRACT, USDT_ADDRESS, USDC_ADDRESS, ADDRESS} from '@space/hooks/api';
import {useConnector} from '@space/components/Wallet';
import UAHT_JAR_ABI from '@space/contracts/UAHT_JAR.abi.json';
import ERC20_ABI from '@space/contracts/ERC20.abi.json';
import {useContractWrite, usePrepareContractWrite, useContractReads, useContractRead} from 'wagmi';
import {formatUnits} from 'viem';
import {useEffect, useState} from 'react';
import {useDebounce} from '@space/hooks/helpers';
import {precision} from './helpers';
import {JarBadge, JarRange, JarRangeInput, JarTo} from './Jar';
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

const usdcContract = {
  address: USDC_ADDRESS,
  abi: ERC20_ABI as any,
} as const;

const usdContracts = {USDT: usdtContract, USDC: usdcContract} as any;

export const Jar = ({jarAsset}: any) => {
  const MM = useConnector();
  const {data: results} = useContractReads({
    watch: true,
    contracts: [
      {...jarContract, functionName: 'free_uaht'},
      {...jarContract, functionName: 'total_asset', args: [USDT_ADDRESS]},
      {...uahtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdtContract, functionName: 'allowance', args: [MM.account, JAR_CONTRACT]},
      {...jarContract, functionName: 'total_asset', args: [USDC_ADDRESS]},
      {...usdcContract, functionName: 'balanceOf', args: [MM.account]},
      {...usdcContract, functionName: 'allowance', args: [MM.account, JAR_CONTRACT]},
    ],
  }) as any;

  const freeUaht: any = +formatUnits(results?.[0]?.result || 0, 2);
  const totalUsdt: any = +formatUnits(results?.[1]?.result || 0, 6);
  const balanceUaht: any = +formatUnits(results?.[2]?.result || 0, 2);
  const balanceUsdt: any = +formatUnits(results?.[3]?.result || 0, 6);
  const allowanceUsdt: any = +formatUnits(results?.[4]?.result || 0, 6);
  const totalUsdc: any = +formatUnits(results?.[5]?.result || 0, 6);
  const balanceUsdc: any = +formatUnits(results?.[6]?.result || 0, 6);
  const allowanceUsdc: any = +formatUnits(results?.[7]?.result || 0, 6);

  const usdTotal = {USDT: totalUsdt, USDC: totalUsdc} as any;
  const usdBalance = {USDT: balanceUsdt, USDC: balanceUsdc} as any;
  const usdAllowance = {USDT: allowanceUsdt, USDC: allowanceUsdc} as any;

  const [selected, setSelected] = useState('UAHT');
  useEffect(() => {
    if (selected !== 'UAHT' && jarAsset !== selected) {
      setSelected(jarAsset);
    }
  }, [jarAsset, selected, setSelected]);

  const [usdValue, setUsdValue] = useState(0);
  const [uahtValue, setUahtValue] = useState(0);

  const usdValueDebounced = useDebounce(usdValue, 1234);
  const uahtValueDebounced = useDebounce(uahtValue, 1234);

  const {write: approveUsd, isLoading: approveUsdLoading} = useContractWrite(
    usdValueDebounced && usdValue === usdValueDebounced
      ? {
          ...usdContracts[jarAsset],
          functionName: 'approve',
          args: [JAR_CONTRACT, usdValueDebounced * 10 ** 6],
        }
      : {}
  ) as any;

  const {data: toUahtData} = useContractRead(
    usdValueDebounced && usdValue === usdValueDebounced
      ? {
          ...jarContract,
          functionName: 'to_uaht',
          args: [usdContracts[jarAsset].address, usdValueDebounced * 10 ** 6],
        }
      : {}
  ) as any;

  const {data: simulatedUahtData, config: simulatedUahtConfig} = usePrepareContractWrite(
    usdValueDebounced && usdValue === usdValueDebounced
      ? {
          ...jarContract,
          functionName: 'put',
          args: [usdContracts[jarAsset].address, usdValueDebounced * 10 ** 6, MM.account],
          scopeKey: usdAllowance[jarAsset],
        }
      : {}
  ) as any;

  const {write: putUaht, isLoading: putUahtLoading} = useContractWrite(
    simulatedUahtConfig?.request
      ? {
          ...simulatedUahtConfig,
          onSuccess: () => {
            setUsdValue(0);
          },
        }
      : {}
  ) as any;

  const {data: simulatedUsdData, config: simulatedUsdConfig} = usePrepareContractWrite(
    uahtValueDebounced && uahtValue === uahtValueDebounced
      ? {
          ...jarContract,
          functionName: 'pop',
          args: [usdContracts[jarAsset].address, uahtValueDebounced * 10 ** 2, MM.account],
        }
      : {}
  ) as any;

  const {write: popUsd, isLoading: popUsdLoading} = useContractWrite(
    simulatedUsdConfig?.request
      ? {
          ...simulatedUsdConfig,
          onSuccess: () => {
            setUahtValue(0);
          },
        }
      : {}
  ) as any;

  const toUaht: any = +formatUnits(toUahtData || 0, 2);
  const simulatedUaht: any = +formatUnits(simulatedUahtData?.result || 0, 2);
  const simulatedUsd: any = +formatUnits(simulatedUsdData?.result || 0, 6);

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
          asset={jarAsset}
          selected={selected === jarAsset}
          value={precision(usdTotal[jarAsset], 2)}
          onClick={() => setSelected(jarAsset)}
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
              {...{
                min: 0,
                max: Math.floor(usdBalance[jarAsset]),
                value: usdValue,
                onChange: setUsdValue,
              }}
            />
            <div>
              <JarRangeInput
                {...{
                  min: 0,
                  max: Math.floor(usdBalance[jarAsset]),
                  value: usdValue,
                  onChange: setUsdValue,
                }}
              />
              <Text b>{jarAsset}</Text> внесок 📥
            </div>
          </div>
          <Row>
            <JarTo to={MM.account} />
          </Row>
          <Row align="center">
            {usdAllowance[jarAsset] < usdValue ? (
              <Button
                className={styles.button}
                size="sm"
                auto
                icon={
                  approveUsdLoading ? (
                    <Loading color="white" type="points-opacity" size="xs" />
                  ) : (
                    undefined
                  )
                }
                onClick={() => approveUsd?.()}
              >
                Дозволити {usdValue || ''} {jarAsset}
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
              <JarRangeInput
                {...{
                  min: 0,
                  max: Math.floor(balanceUaht),
                  value: uahtValue,
                  onChange: setUahtValue,
                }}
              />
              <Text b>UAHT</Text> внесок 📥
            </div>
          </div>
          <Row>
            <JarTo to={MM.account} />
          </Row>
          <Row align="center">
            <Button
              className={styles.button}
              size="sm"
              auto
              bordered
              color="success"
              css={{color: 'white'}}
              disabled={!simulatedUsd}
              icon={
                popUsdLoading ? (
                  <Loading color="white" type="points-opacity" size="xs" />
                ) : (
                  undefined
                )
              }
              onClick={() => popUsd?.()}
            >
              Взяти {precision(simulatedUsd, 2) || ''} {jarAsset}
            </Button>
          </Row>
        </Row>
      )}
    </div>
  );
};
