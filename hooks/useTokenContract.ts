import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ERC20_ABI, ERC20Contract } from '../contracts/interfaces/ITokenSwap';

export function useTokenContract(tokenAddress: string) {
  const [contract, setContract] = useState<ERC20Contract | null>(null);
  const [decimals, setDecimals] = useState<number>(18);
  const [symbol, setSymbol] = useState<string>('');
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (!tokenAddress || !window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const typedContract = tokenContract as unknown as ERC20Contract;

    setContract(typedContract);

    // Fetch token details
    const fetchTokenDetails = async () => {
      try {
        const [decimalsResult, symbolResult, nameResult] = await Promise.all([
          typedContract.decimals(),
          typedContract.symbol(),
          typedContract.name(),
        ]);

        setDecimals(decimalsResult);
        setSymbol(symbolResult);
        setName(nameResult);
      } catch (error) {
        console.error('Error fetching token details:', error);
      }
    };

    fetchTokenDetails();
  }, [tokenAddress]);

  const getBalance = async (address: string): Promise<string> => {
    if (!contract) return '0';
    try {
      const balance = await contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const approve = async (spenderAddress: string, amount: string): Promise<boolean> => {
    if (!contract) return false;
    try {
      const parsedAmount = ethers.utils.parseUnits(amount, decimals);
      const tx = await contract.approve(spenderAddress, parsedAmount);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error approving token:', error);
      return false;
    }
  };

  const getAllowance = async (ownerAddress: string, spenderAddress: string): Promise<string> => {
    if (!contract) return '0';
    try {
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      return ethers.utils.formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Error fetching allowance:', error);
      return '0';
    }
  };

  return {
    contract,
    decimals,
    symbol,
    name,
    getBalance,
    approve,
    getAllowance,
  };
} 