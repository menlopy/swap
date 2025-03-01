import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V2_PAIR_ABI,
  UNISWAP_ADDRESSES
} from '../contracts/interfaces/IUniswapV2';

export function useUniswap() {
  const [factory, setFactory] = useState<ethers.Contract | null>(null);
  const [router, setRouter] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const factoryContract = new ethers.Contract(
      UNISWAP_ADDRESSES.FACTORY,
      UNISWAP_V2_FACTORY_ABI,
      signer
    );

    const routerContract = new ethers.Contract(
      UNISWAP_ADDRESSES.ROUTER,
      UNISWAP_V2_ROUTER_ABI,
      signer
    );

    setFactory(factoryContract);
    setRouter(routerContract);
    setLoading(false);
  }, []);

  const addLiquidity = async (
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
    slippage: number = 0.5
  ) => {
    if (!router || !factory) throw new Error('Contracts not initialized');

    const amountADesired = ethers.utils.parseUnits(amountA, 18);
    const amountBDesired = ethers.utils.parseUnits(amountB, 18);

    // Slippage hesaplama
    const amountAMin = amountADesired.mul(1000 - Math.floor(slippage * 10)).div(1000);
    const amountBMin = amountBDesired.mul(1000 - Math.floor(slippage * 10)).div(1000);

    // Deadline: 20 dakika
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
      const tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        window.ethereum.selectedAddress,
        deadline
      );

      return await tx.wait();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  };

  const removeLiquidity = async (
    tokenA: string,
    tokenB: string,
    liquidity: string,
    slippage: number = 0.5
  ) => {
    if (!router || !factory) throw new Error('Contracts not initialized');

    const liquidityAmount = ethers.utils.parseUnits(liquidity, 18);
    
    // Get pair address
    const pairAddress = await factory.getPair(tokenA, tokenB);
    const pair = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, router.signer);
    
    // Get reserves
    const [reserve0, reserve1] = await pair.getReserves();
    const totalSupply = await pair.totalSupply();
    
    // Calculate minimum amounts
    const amount0 = liquidityAmount.mul(reserve0).div(totalSupply);
    const amount1 = liquidityAmount.mul(reserve1).div(totalSupply);
    
    const amount0Min = amount0.mul(1000 - Math.floor(slippage * 10)).div(1000);
    const amount1Min = amount1.mul(1000 - Math.floor(slippage * 10)).div(1000);

    // Deadline: 20 dakika
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
      const tx = await router.removeLiquidity(
        tokenA,
        tokenB,
        liquidityAmount,
        amount0Min,
        amount1Min,
        window.ethereum.selectedAddress,
        deadline
      );

      return await tx.wait();
    } catch (error) {
      console.error('Error removing liquidity:', error);
      throw error;
    }
  };

  const getReserves = async (tokenA: string, tokenB: string) => {
    if (!factory) throw new Error('Factory contract not initialized');

    const pairAddress = await factory.getPair(tokenA, tokenB);
    if (pairAddress === ethers.constants.AddressZero) {
      return [0, 0];
    }

    const pair = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, factory.provider);
    const [reserve0, reserve1] = await pair.getReserves();
    
    return [
      ethers.utils.formatUnits(reserve0, 18),
      ethers.utils.formatUnits(reserve1, 18)
    ];
  };

  const getLPBalance = async (tokenA: string, tokenB: string, address: string) => {
    if (!factory) throw new Error('Factory contract not initialized');

    const pairAddress = await factory.getPair(tokenA, tokenB);
    if (pairAddress === ethers.constants.AddressZero) {
      return '0';
    }

    const pair = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, factory.provider);
    const balance = await pair.balanceOf(address);
    
    return ethers.utils.formatUnits(balance, 18);
  };

  return {
    factory,
    router,
    loading,
    addLiquidity,
    removeLiquidity,
    getReserves,
    getLPBalance
  };
} 