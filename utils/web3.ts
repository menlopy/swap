import { ethers } from 'ethers';
import { MONAD_CHAIN_ID, MONAD_RPC_URL } from '../constants/contracts';

export async function switchToMonadNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MONAD_CHAIN_ID,
              chainName: 'Monad Network',
              nativeCurrency: {
                name: 'MONAD',
                symbol: 'MONAD',
                decimals: 18,
              },
              rpcUrls: [MONAD_RPC_URL],
              blockExplorerUrls: ['https://monad.xyz'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Monad network:', addError);
      }
    }
    console.error('Error switching to Monad network:', switchError);
    return false;
  }
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: string | number, decimals: number = 6): string {
  return Number(amount).toFixed(decimals);
}

export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  inputDecimals: number,
  outputDecimals: number
): number {
  const input = ethers.utils.parseUnits(inputAmount, inputDecimals);
  const output = ethers.utils.parseUnits(outputAmount, outputDecimals);
  const impact = input.sub(output).mul(100).div(input);
  return Math.abs(impact.toNumber());
}

export function calculateSlippage(amount: string, slippagePercent: number): string {
  const parsedAmount = ethers.utils.parseEther(amount);
  const slippageMultiplier = ethers.utils.parseEther((1 - slippagePercent / 100).toString());
  const minAmount = parsedAmount.mul(slippageMultiplier).div(ethers.utils.parseEther('1'));
  return ethers.utils.formatEther(minAmount);
}

export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  args: any[],
  multiplier: number = 1.2
): Promise<ethers.BigNumber> {
  try {
    const gasEstimate = await contract.estimateGas[method](...args);
    return gasEstimate.mul(Math.floor(multiplier * 100)).div(100);
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
} 