import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  ArrowDownIcon, 
  Cog6ToothIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/solid';
import TokenSelectModal, { Token } from './TokenSelectModal';
import SettingsModal from './SettingsModal';
import TransactionHistory from './TransactionHistory';
import PriceChart from './PriceChart';
import { useTokenContract } from '../hooks/useTokenContract';
import { useUniswap } from '../hooks/useUniswap';
import { useDexAggregator, QuoteResult } from '../hooks/useDexAggregator';
import { UNISWAP_ADDRESSES } from '../contracts/interfaces/IUniswapV2';
import { calculatePriceImpact, calculateSlippage } from '../utils/web3';
import { toast, Toaster } from 'react-hot-toast';

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

// DEX Karşılaştırma Bileşeni
const DexComparison = ({ quotes }: { quotes: QuoteResult[] }) => {
  // DEX logoları için basit bir mapping
  const dexLogos: Record<string, string> = {
    "Uniswap": "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    "SushiSwap": "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
    "MonadSwap": "https://www.monad.xyz/monad.svg",
    "PancakeSwap": "https://cryptologos.cc/logos/pancakeswap-cake-logo.png",
    "TraderJoe": "https://cryptologos.cc/logos/trader-joe-joe-logo.png",
    "Balancer": "https://cryptologos.cc/logos/balancer-bal-logo.png"
  };

  // En iyi teklifi bul
  const bestQuote = quotes.reduce((best, current) => {
    const bestAmount = parseFloat(best.amountOut);
    const currentAmount = parseFloat(current.amountOut);
    return currentAmount > bestAmount ? current : best;
  }, quotes[0]);

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 mt-4 border border-gray-800">
      <h3 className="text-white text-lg font-medium mb-3">DEX Comparison</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {quotes.map((quote, index) => {
          const isHighest = quote.dexName === bestQuote.dexName;
          const outputAmount = parseFloat(quote.amountOut);
          const bestAmount = parseFloat(bestQuote.amountOut);
          const percentageDiff = ((outputAmount - bestAmount) / bestAmount) * 100;
          
          return (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                isHighest ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-[#2a2a2a] hover:bg-[#333333]'
              }`}
            >
              <div className="flex items-center space-x-3">
                {dexLogos[quote.dexName] && (
                  <img 
                    src={dexLogos[quote.dexName]} 
                    alt={`${quote.dexName} logo`} 
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="text-white font-medium flex items-center">
                  {quote.dexName}
                    {isHighest && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Best
                  </span>
                )}
              </div>
                  <div className="text-gray-400 text-xs">
                    Price Impact: <span className={`${quote.priceImpact > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {quote.priceImpact.toFixed(2)}%
                </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{parseFloat(quote.amountOut).toFixed(6)}</div>
                {!isHighest && (
                  <div className="text-red-400 text-xs">
                    {percentageDiff.toFixed(2)}% less
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// DEX Seçim Modalı
const DexSelectModal = ({ 
  isOpen, 
  onClose, 
  availableDexes, 
  selectedDexes, 
  onSelectDex 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  availableDexes: string[]; 
  selectedDexes: string[]; 
  onSelectDex: (dex: string, selected: boolean) => void;
}) => {
  // DEX logoları için basit bir mapping
  const dexLogos: Record<string, string> = {
    "Uniswap": "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    "SushiSwap": "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
    "MonadSwap": "https://www.monad.xyz/monad.svg",
    "PancakeSwap": "https://cryptologos.cc/logos/pancakeswap-cake-logo.png",
    "TraderJoe": "https://cryptologos.cc/logos/trader-joe-joe-logo.png",
    "Balancer": "https://cryptologos.cc/logos/balancer-bal-logo.png"
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 w-full max-w-md relative z-10 border border-gray-800">
        <h3 className="text-xl font-medium text-white mb-4">Select DEXes</h3>
        <p className="text-gray-400 text-sm mb-4">
          Choose which DEXes to include when finding the best price for your swap.
        </p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableDexes.map((dex) => (
            <div key={dex} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-xl hover:bg-[#333333] transition-colors">
              <div className="flex items-center space-x-3">
                {dexLogos[dex] && (
                  <img 
                    src={dexLogos[dex]} 
                    alt={`${dex} logo`} 
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="text-white font-medium">{dex}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={selectedDexes.includes(dex)}
                  onChange={(e) => onSelectDex(dex, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <button 
            onClick={() => {
              // Tüm DEX'leri seç
              availableDexes.forEach(dex => onSelectDex(dex, true));
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            Select All
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
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
  const [allQuotes, setAllQuotes] = useState<QuoteResult[]>([]);
  const [showDexComparison, setShowDexComparison] = useState(false);
  const [isDexSelectModalOpen, setIsDexSelectModalOpen] = useState(false);
  const [availableDexes, setAvailableDexes] = useState<string[]>([]);
  const [selectedDexes, setSelectedDexes] = useState<string[]>([]);

  const { router } = useUniswap();
  const { adapters, bestRoute, getBestQuote, executeSwap } = useDexAggregator();
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

  // Mevcut adaptörleri takip et ve DEX listesini güncelle
  useEffect(() => {
    if (adapters.length > 0) {
      const dexNames = adapters.map(adapter => adapter.getName());
      setAvailableDexes(dexNames);
      setSelectedDexes(dexNames); // Varsayılan olarak tüm DEX'leri seç
    }
  }, [adapters]);

  // DEX seçimini güncelle
  const handleDexSelection = (dex: string, selected: boolean) => {
    if (selected) {
      setSelectedDexes(prev => [...prev, dex]);
    } else {
      setSelectedDexes(prev => prev.filter(d => d !== dex));
    }
  };

  const calculatePriceImpactAndOutput = async () => {
    if (!token1 || !token2 || !amount1 || adapters.length === 0) {
      console.log("Fiyat hesaplanamıyor çünkü:", {
        token1: token1 ? "Var" : "Yok",
        token2: token2 ? "Var" : "Yok",
        amount1: amount1 || "Boş",
        adaptersLength: adapters.length
      });
      return;
    }

    try {
      console.log("Fiyat hesaplanıyor:", {
        token1Address: token1.address,
        token1Symbol: token1.symbol,
        token2Address: token2.address,
        token2Symbol: token2.symbol,
        amount1,
        selectedDexes
      });

      // Seçili DEX'lere göre adaptörleri filtrele
      const filteredAdapters = adapters.filter(adapter => 
        selectedDexes.includes(adapter.getName())
      );
      
      if (filteredAdapters.length === 0) {
        console.log("Seçili DEX bulunamadı");
        setAmount2('');
        setPriceImpact(0);
        return;
      }

      // Tüm seçili DEX'lerden fiyat teklifi al
      const quotes = await Promise.all(
        filteredAdapters.map(adapter => 
          adapter.getQuote(token1.address, token2.address, amount1)
            .catch(error => {
              console.error(`Error getting quote from ${adapter.getName()}:`, error);
              return null;
            })
        )
      );

      console.log("Alınan teklifler:", quotes);

      // Geçerli teklifleri filtrele
      const validQuotes = quotes.filter(quote => quote !== null) as QuoteResult[];
      console.log("Geçerli teklifler:", validQuotes);
      setAllQuotes(validQuotes);
      
      if (validQuotes.length === 0) {
        console.log("Geçerli teklif bulunamadı");
        setAmount2('');
        setPriceImpact(0);
        return;
      }

      // En iyi teklifi bul (en yüksek çıkış miktarı)
      const bestQuote = validQuotes.reduce((best, current) => {
        const bestAmount = parseFloat(best.amountOut);
        const currentAmount = parseFloat(current.amountOut);
        return currentAmount > bestAmount ? current : best;
      }, validQuotes[0]);

      console.log("En iyi teklif:", bestQuote);
      setAmount2(bestQuote.amountOut);
      setPriceImpact(bestQuote.priceImpact);
    } catch (error) {
      console.error("Error calculating price impact:", error);
      setAmount2('');
      setPriceImpact(0);
    }
  };

  useEffect(() => {
    if (amount1 && token1 && token2) {
      calculatePriceImpactAndOutput();
    }
  }, [amount1, token1, token2, adapters]);

  const handleSwap = async () => {
    if (!token1 || !token2 || !amount1 || !account || !signer) return;

    try {
      setIsLoading(true);
      
      // Seçili DEX'lere göre adaptörleri filtrele
      const filteredAdapters = adapters.filter(adapter => 
        selectedDexes.includes(adapter.getName())
      );
      
      if (filteredAdapters.length === 0) {
        toast.error("No DEXes selected. Please select at least one DEX.");
        setIsLoading(false);
        return;
      }

      // Tüm seçili DEX'lerden fiyat teklifi al
      const quotes = await Promise.all(
        filteredAdapters.map(adapter => 
          adapter.getQuote(token1.address, token2.address, amount1)
            .catch(error => {
              console.error(`Error getting quote from ${adapter.getName()}:`, error);
              return null;
            })
        )
      );

      // Geçerli teklifleri filtrele
      const validQuotes = quotes.filter(quote => quote !== null) as QuoteResult[];
      
      if (validQuotes.length === 0) {
        toast.error("Could not get any valid quotes. Please try again.");
        setIsLoading(false);
        return;
      }

      // En iyi teklifi bul (en yüksek çıkış miktarı)
      const bestQuote = validQuotes.reduce((best, current) => {
        const bestAmount = parseFloat(best.amountOut);
        const currentAmount = parseFloat(current.amountOut);
        return currentAmount > bestAmount ? current : best;
      }, validQuotes[0]);

      console.log("En iyi teklif ile swap yapılıyor:", bestQuote);

      // En iyi teklifi veren DEX'i bul
      const bestAdapter = filteredAdapters.find(adapter => 
        adapter.getName() === bestQuote.dexName
      );

      if (!bestAdapter) {
        toast.error("Could not find the adapter for the best quote. Please try again.");
        setIsLoading(false);
        return;
      }

      // Slippage hesapla
      const amountOutMin = (parseFloat(bestQuote.amountOut) * (1 - slippageTolerance / 100)).toString();
      
      // Swap işlemini gerçekleştir
      const tx = await bestAdapter.executeSwap({
        tokenIn: token1.address,
        tokenOut: token2.address,
        amountIn: amount1,
        amountOutMin,
        recipient: account,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20 // 20 dakika
      });

      console.log("Swap transaction:", tx);
      
      // İşlem hash'ini göster
      toast.success(
        <div>
          Swap submitted!
          <a 
            href={`https://explorer.monad.xyz/tx/${tx.hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 ml-2"
          >
            View on Explorer
          </a>
        </div>
      );

      // İşlem onayını bekle
      await tx.wait();
      
      // Bakiyeleri güncelle
      updateBalances();
      
      // Başarılı mesajı göster
      toast.success("Swap completed successfully!");
      
      // Formu sıfırla
        setAmount1('');
        setAmount2('');
      
    } catch (error: any) {
      console.error("Swap error:", error);
      toast.error(`Swap failed: ${error.message || "Unknown error"}`);
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
    <div className="w-full max-w-md mx-auto">
      <Toaster position="top-right" />
      
      {/* Swap Card */}
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-4 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-white flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Swap</span>
          </h2>
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
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
              title="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsDexSelectModalOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
              title="Select DEXes"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
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
              const temp = token1;
              setToken1(token2);
              setToken2(temp);
              setAmount1('');
              setAmount2('');
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
          
          {/* Fiyat Bulunamadı Uyarısı */}
          {token1 && token2 && amount1 && !amount2 && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="text-yellow-500 text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>
                  Price information cannot be retrieved. There may be no liquidity pool for this token pair or the selected DEXs may not support this pair.
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Suggestions:
                <ul className="list-disc list-inside mt-1">
                  <li>Select a different token pair</li>
                  <li>Enable different DEXs from the DEX selection menu</li>
                  <li>Try a smaller amount</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Best Route Info */}
        {bestRoute && (
          <div className="mt-3 p-2 bg-[#1a1a1a] rounded-xl border border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-300">
                    Best price via <span className="text-blue-400 font-medium">{bestRoute.dexName}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Price impact: <span className={`${
                      bestRoute.priceImpact > 3 ? 'text-red-400' : 
                      bestRoute.priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'
                    }`}>{bestRoute.priceImpact.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDexComparison(!showDexComparison)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20"
              >
                {showDexComparison ? 'Hide comparison' : 'Compare DEXes'}
              </button>
            </div>
          </div>
        )}

        {/* DEX Comparison */}
        {showDexComparison && allQuotes.length > 0 && (
          <DexComparison quotes={allQuotes} />
        )}

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

      {/* Transaction History */}
      <TransactionHistory account={account} />

      {/* Modals */}
      <TokenSelectModal
        isOpen={isToken1SelectModalOpen}
        onClose={() => setIsToken1SelectModalOpen(false)}
        onSelect={setToken1}
        selectedToken={token1 || undefined}
        account={account || undefined}
      />
      <TokenSelectModal
        isOpen={isToken2SelectModalOpen}
        onClose={() => setIsToken2SelectModalOpen(false)}
        onSelect={setToken2}
        selectedToken={token2 || undefined}
        account={account || undefined}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        slippage={slippageTolerance}
        onSlippageChange={setSlippageTolerance}
      />
      <DexSelectModal
        isOpen={isDexSelectModalOpen}
        onClose={() => setIsDexSelectModalOpen(false)}
        availableDexes={availableDexes}
        selectedDexes={selectedDexes}
        onSelectDex={handleDexSelection}
      />
    </div>
  );
};

export default SwapInterface; 