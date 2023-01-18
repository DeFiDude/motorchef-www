import { 
    usePrepareContractWrite, 
    useContractWrite, 
    Address, 
    useWaitForTransaction,
    erc20ABI,
} from 'wagmi'
import { MOTORCHEF, CINU_WCANTO_LP_PAIR } from 'utils/env-vars';
import { GreenButton, Text } from 'styles'
import styled from 'styled-components';
import {useNeedsLPApproval, useStakedBalance} from 'hooks';
import { MaxUint256 } from '@ethersproject/constants'
import AddButton from 'components/AddButton/AddButton';

const StyledButtonContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`

const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[0]}px;
  width: 100%;
`

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[3]}px;
  width: ${(props) => props.theme.spacing[3]}px;
`

const PrepareLPApproval = () => {
  const { 
      config,
      error: prepareError,
      isError: isPrepareError,
  } = usePrepareContractWrite({
      address: CINU_WCANTO_LP_PAIR as Address,
      abi: erc20ABI,
      functionName: 'approve',
      args: [MOTORCHEF as Address, MaxUint256]
  })

  return {config: config, error: prepareError, isError: isPrepareError}
}

export const StakeButton = () => {
    const isApproved = useNeedsLPApproval()
    const isStaked = useStakedBalance()?.amount !== '0' ? true : false
  
    const preparedConfig  = isApproved? PrepareLPApproval() : PrepareLPApproval()
    
    const { data, error, isError, write } = useContractWrite(preparedConfig.config)

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    return (
      <StyledButtonContent>
        <StyledCardActions>
          <GreenButton disabled={!write || isLoading || !isStaked} onClick={() => write()}>
            <Text
              fontWeight={700}
              fontSize={16}
            >
              {isApproved 
                ? 'Unstake'
                  : 'Approve vAMM CINU-WCANTO LP'}
            </Text>
          </GreenButton>
          <StyledActionSpacer/>
          <AddButton disabled={false}/>
        </StyledCardActions>
        {isSuccess && (
          <div>
            <a href={`https://evm.explorer.canto.io/tx/${data?.hash}`}>See Transaction</a>
          </div>
        )}
      </StyledButtonContent>
    )

}