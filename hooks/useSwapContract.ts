import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { TOKEN_SWAP_ABI, TokenSwapContract } from '../contracts/interfaces/ITokenSwap';

export function useSwapContract(contractAddress: string) {
  const [contract, setContract] = useState<TokenSwapContract | null>(null);
  const [token1Address, setToken1Address] = useState<string>('');
  const [token2Address, setToken2Address] = useState<string>('');
  const [rate, setRate] = useState<string>('0');

  useEffect(() => {
    if (!contractAddress || !window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const swapContract = new ethers.Contract(contractAddress, TOKEN_SWAP_ABI, signer);
    const typedContract = swapContract as unknown as TokenSwapContract;

    setContract(typedContract);

    // Fetch contract details
    const fetchContractDetails = async () => {
      try {
        const [token1Result, token2Result, rateResult] = await Promise.all([
          typedContract.token1(),
          typedContract.token2(),
          typedContract.getSwapRate(),
        ]);

        setToken1Address(token1Result);
        setToken2Address(token2Result);
        setRate(ethers.utils.formatUnits(rateResult, 18)); // Assuming 18 decimals
      } catch (error) {
        console.error('Error fetching contract details:', error);
      }
    };

    fetchContractDetails();
  }, [contractAddress]);

  const executeSwap = async (amount: string): Promise<boolean> => {
    if (!contract) return false;
    try {
      const parsedAmount = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await contract.swap(parsedAmount);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error executing swap:', error);
      return false;
    }
  };

  return {
    contract,
    token1Address,
    token2Address,
    rate,
    executeSwap,
  };
} 