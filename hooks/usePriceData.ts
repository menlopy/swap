import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useUniswap } from './useUniswap';

interface PriceData {
  timestamp: number;
  price: number;
}

export function usePriceData(token1Address: string, token2Address: string) {
  const [historicalPrices, setHistoricalPrices] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getReserves } = useUniswap();

  // Fetch historical price data
  const fetchHistoricalPrices = async (days: number = 7) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get current reserves and calculate current price
      const [reserve1, reserve2] = await getReserves(token1Address, token2Address);
      const currentPrice = parseFloat(ethers.utils.formatEther(reserve2)) / 
                         parseFloat(ethers.utils.formatEther(reserve1));

      // Generate historical data points
      const now = Date.now();
      const dataPoints: PriceData[] = [];
      
      // For now, we'll generate mock historical data
      // This should be replaced with actual API calls
      for (let i = days; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000;
        // Add some random variation to the current price
        const randomVariation = 1 + (Math.random() * 0.4 - 0.2); // ±20% variation
        const price = currentPrice * randomVariation;
        dataPoints.push({ timestamp, price });
      }

      setHistoricalPrices(dataPoints);
      setCurrentPrice(currentPrice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price data');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!token1Address || !token2Address) return;

    // Initial fetch
    fetchHistoricalPrices();

    // Set up periodic updates (simulating WebSocket for now)
    const interval = setInterval(async () => {
      try {
        const [reserve1, reserve2] = await getReserves(token1Address, token2Address);
        const price = parseFloat(ethers.utils.formatEther(reserve2)) / 
                     parseFloat(ethers.utils.formatEther(reserve1));
        setCurrentPrice(price);
        
        // Add new price point to historical data
        setHistoricalPrices(prev => {
          const newPoint = { timestamp: Date.now(), price };
          // Keep only last 7 days of data
          const filtered = prev.filter(p => p.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
          return [...filtered, newPoint];
        });
      } catch (err) {
        console.error('Error updating price:', err);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [token1Address, token2Address]);

  return {
    historicalPrices,
    currentPrice,
    isLoading,
    error,
    fetchHistoricalPrices
  };
} 