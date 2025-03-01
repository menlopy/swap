import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  ArrowDownIcon, 
  Cog6ToothIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import TokenSelectModal, { Token } from './TokenSelectModal';
import SettingsModal from './SettingsModal';
import DEXStats from './TransactionHistory';
import PriceChart from './PriceChart';
import { useTokenContract } from '../hooks/useTokenContract';
import { useUniswap } from '../hooks/useUniswap';
import { UNISWAP_ADDRESSES } from '../contracts/interfaces/IUniswapV2';
import { calculatePriceImpact, calculateSlippage } from '../utils/web3';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

const PriceImpactWarning = ({ priceImpact }: { priceImpact: number }) => {
  if (!priceImpact || priceImpact < 1) return null;

  let message = '';
  let color = '';

  if (priceImpact >= 5) {
    message = 'High price impact! Your trade will move the market significantly.';
    color = 'text-red-500';
  } else if (priceImpact >= 3) {
    message = 'Medium price impact. Consider reducing your trade size.';
    color = 'text-yellow-500';
  } else {
    message = 'Low price impact.';
    color = 'text-green-500';
  }

  return (
    <div className={`flex items-center gap-2 ${color} text-sm mt-2`}>
      <ExclamationTriangleIcon className="h-4 w-4" />
      {message}
    </div>
  );
};

const SwapInterface = () => {
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isToken1SelectModalOpen, setIsToken1SelectModalOpen] = useState(false);
  const [isToken2SelectModalOpen, setIsToken2SelectModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceImpact, setPriceImpact] = useState(0);
  const [showChart, setShowChart] = useState(false);

  const { router } = useUniswap();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      setSigner(web3Provider.getSigner());
    }
  }, []);

  useEffect(() => {
    if (provider) {
      provider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });
    }
  }, [provider]);

  const calculatePriceImpactAndOutput = async () => {
    if (!token1 || !token2 || !amount1 || !router) return;

    try {
      const path = [token1.address, token2.address];
      const amountIn = ethers.utils.parseUnits(amount1, token1.decimals);
      
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = ethers.utils.formatUnits(amounts[1], token2.decimals);
      setAmount2(amountOut);

      // Calculate price impact
      const impact = calculatePriceImpact(amount1, amountOut, token1.decimals, token2.decimals);
      setPriceImpact(impact);
    } catch (error) {
      console.error('Error calculating amounts:', error);
      setAmount2('');
      setPriceImpact(0);
    }
  };

  useEffect(() => {
    if (amount1 && token1 && token2) {
      calculatePriceImpactAndOutput();
    }
  }, [amount1, token1, token2, router]);

  const handleSwap = async () => {
    if (!token1 || !token2 || !amount1 || !account || !router || !signer) return;

    try {
      setIsLoading(true);
      // Check allowance and approve if needed
      const token1Contract = new ethers.Contract(token1.address, ERC20_ABI, signer);
      const allowance = await token1Contract.allowance(account, UNISWAP_ADDRESSES.ROUTER);
      
      if (allowance.lt(ethers.utils.parseUnits(amount1, token1.decimals))) {
        const approveTx = await token1Contract.approve(
          UNISWAP_ADDRESSES.ROUTER,
          ethers.constants.MaxUint256
        );
        await approveTx.wait();
      }

      // Execute swap
      const path = [token1.address, token2.address];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
      
      const amountIn = ethers.utils.parseUnits(amount1, token1.decimals);
      const amountOutMin = ethers.utils.parseUnits(
        calculateSlippage(amount2, slippageTolerance),
        token2.decimals
      );

      const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        account,
        deadline
      );
      await tx.wait();

      // Reset form and update balances
      setAmount1('');
      setAmount2('');
      updateBalances();
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalances = async () => {
    if (!account || !token1 || !token2) return;

    const token1Contract = useTokenContract(token1.address);
    const token2Contract = useTokenContract(token2.address);

    const [balance1, balance2] = await Promise.all([
      token1Contract.getBalance(account),
      token2Contract.getBalance(account),
    ]);

    setToken1({ ...token1, balance: balance1 });
    setToken2({ ...token2, balance: balance2 });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Swap Card */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-white">Swap</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`p-2 rounded-xl transition-colors ${
                showChart 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-[#2a2a2a] text-gray-400'
              }`}
              title={showChart ? 'Hide chart' : 'Show chart'}
            >
              <ChartBarIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 hover:bg-[#2a2a2a] rounded-xl transition-colors"
            >
              <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Price Chart */}
        {showChart && token1 && token2 && (
          <div className="mb-4">
            <PriceChart
              token1Address={token1.address}
              token2Address={token2.address}
              token1Symbol={token1.symbol}
              token2Symbol={token2.symbol}
            />
          </div>
        )}

        {/* Token 1 Input */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-2">
          <div className="flex justify-between mb-2">
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl text-white outline-none w-[200px]"
            />
            <button
              onClick={() => setIsToken1SelectModalOpen(true)}
              className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl px-3 py-1 transition-colors"
            >
              {token1 ? (
                <>
                  {token1.logoURI && (
                    <img src={token1.logoURI} alt={token1.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-white">{token1.symbol}</span>
                </>
              ) : (
                <span className="text-white">Select token</span>
              )}
              <ArrowDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          {token1 && (
            <div className="text-sm text-gray-400">
              Balance: {token1.balance} {token1.symbol}
            </div>
          )}
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={() => {
              setToken1(token2);
              setToken2(token1);
              setAmount1(amount2);
              setAmount2(amount1);
            }}
            className="bg-[#2a2a2a] p-2 rounded-xl hover:bg-[#3a3a3a] transition-colors"
          >
            <ArrowPathIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Token 2 Input */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 mt-2">
          <div className="flex justify-between mb-2">
            <input
              type="number"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              placeholder="0.0"
              className="bg-transparent text-2xl text-white outline-none w-[200px]"
              readOnly
            />
            <button
              onClick={() => setIsToken2SelectModalOpen(true)}
              className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl px-3 py-1 transition-colors"
            >
              {token2 ? (
                <>
                  {token2.logoURI && (
                    <img src={token2.logoURI} alt={token2.symbol} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-white">{token2.symbol}</span>
                </>
              ) : (
                <span className="text-white">Select token</span>
              )}
              <ArrowDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          {token2 && (
            <div className="text-sm text-gray-400">
              Balance: {token2.balance} {token2.symbol}
            </div>
          )}
        </div>

        {/* Price Impact Warning */}
        <PriceImpactWarning priceImpact={priceImpact} />

        {/* Swap Button */}
        {account && (
          <button
            onClick={handleSwap}
            disabled={!token1 || !token2 || !amount1 || isLoading}
            className={`w-full mt-4 py-4 rounded-xl text-white font-medium ${
              !token1 || !token2 || !amount1 || isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
            } transition-all duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Swapping...
              </div>
            ) : (
              'Swap'
            )}
          </button>
        )}
      </div>

      {/* DEX Stats */}
      <DEXStats />

      {/* Modals */}
      <TokenSelectModal
        isOpen={isToken1SelectModalOpen}
        onClose={() => setIsToken1SelectModalOpen(false)}
        onSelect={setToken1}
        selectedToken={token1 || undefined}
      />
      <TokenSelectModal
        isOpen={isToken2SelectModalOpen}
        onClose={() => setIsToken2SelectModalOpen(false)}
        onSelect={setToken2}
        selectedToken={token2 || undefined}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        slippage={slippageTolerance}
        onSlippageChange={setSlippageTolerance}
      />
    </div>
  );
};

export default SwapInterface; 