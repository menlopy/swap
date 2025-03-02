import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useUniswap } from './useUniswap';
import { CONTRACTS, SUPPORTED_TOKENS, MONAD_CHAIN_ID } from '../constants/contracts';

// Fiyat teklifi sonuç tipi
export interface QuoteResult {
  dexName: string;
  amountOut: string;
  priceImpact: number;
  path: string[];
  gasEstimate?: string;
}

// Swap parametreleri tipi
export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
}

// Likidite kaynağı adaptörü arayüzü
export interface LiquiditySourceAdapter {
  getName(): string;
  getQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<QuoteResult>;
  executeSwap(params: SwapParams): Promise<ethers.providers.TransactionResponse>;
}

// Uniswap V2 Adaptörü
class UniswapV2Adapter implements LiquiditySourceAdapter {
  private router: ethers.Contract;
  private signer: ethers.Signer;
  private routerAddress: string;

  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    this.router = router;
    this.signer = signer;
    this.routerAddress = routerAddress;
  }

  getName(): string {
    return "Uniswap V2";
  }

  async getQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<QuoteResult> {
    try {
      console.log(`${this.getName()} getQuote başlatılıyor:`, {
        tokenIn,
        tokenOut,
        amountIn
      });

      const path = [tokenIn, tokenOut];
      const tokenInObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenIn.toLowerCase());
      const tokenOutObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenOut.toLowerCase());
      
      if (!tokenInObj || !tokenOutObj) {
        console.error(`Token bulunamadı: tokenIn=${!!tokenInObj}, tokenOut=${!!tokenOutObj}`);
        throw new Error("Token not found");
      }

      console.log(`${this.getName()} token bilgileri:`, {
        tokenInObj,
        tokenOutObj
      });

      const amountInWei = ethers.utils.parseUnits(amountIn, tokenInObj.decimals);
      console.log(`${this.getName()} router.getAmountsOut çağrılıyor:`, {
        amountInWei: amountInWei.toString(),
        path
      });

      const amounts = await this.router.getAmountsOut(amountInWei, path);
      console.log(`${this.getName()} getAmountsOut sonucu:`, {
        amounts: amounts.map((a: ethers.BigNumber) => a.toString())
      });

      const amountOutFormatted = ethers.utils.formatUnits(amounts[1], tokenOutObj.decimals);
      
      // Fiyat etkisi hesaplama
      const priceImpact = this.calculatePriceImpact(amountIn, amountOutFormatted, tokenInObj, tokenOutObj);

      console.log(`${this.getName()} getQuote tamamlandı:`, {
        amountOut: amountOutFormatted,
        priceImpact
      });

      return {
        dexName: this.getName(),
        amountOut: amountOutFormatted,
        priceImpact,
        path
      };
    } catch (error) {
      console.error(`Error getting quote from ${this.getName()}:`, error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<ethers.providers.TransactionResponse> {
    const { tokenIn, tokenOut, amountIn, amountOutMin, recipient, deadline } = params;
    
    const tokenInObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenIn.toLowerCase());
    const tokenOutObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenOut.toLowerCase());
    
    if (!tokenInObj || !tokenOutObj) {
      throw new Error("Token not found");
    }

    const amountInWei = ethers.utils.parseUnits(amountIn, tokenInObj.decimals);
    const amountOutMinWei = ethers.utils.parseUnits(amountOutMin, tokenOutObj.decimals);
    
    const path = [tokenIn, tokenOut];
    
    // Önce token onayını kontrol et
    const tokenContract = new ethers.Contract(
      tokenIn,
      [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
      ],
      this.signer
    );
    
    const signerAddress = await this.signer.getAddress();
    const allowance = await tokenContract.allowance(signerAddress, this.routerAddress);
    
    if (allowance.lt(amountInWei)) {
      const approveTx = await tokenContract.approve(
        this.routerAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
    }
    
    return this.router.swapExactTokensForTokens(
      amountInWei,
      amountOutMinWei,
      path,
      recipient,
      deadline
    );
  }

  private calculatePriceImpact(amountIn: string, amountOut: string, tokenIn: any, tokenOut: any): number {
    try {
      const inputAmount = parseFloat(amountIn);
      const outputAmount = parseFloat(amountOut);
      
      if (inputAmount <= 0 || outputAmount <= 0) return 0;
      
      // Basit bir fiyat etkisi hesaplama
      // Gerçek bir implementasyonda, rezervleri kullanarak daha doğru bir hesaplama yapılabilir
      // Şimdilik işlem büyüklüğüne göre basit bir hesaplama yapıyoruz
      if (inputAmount > 1000) return 5;
      if (inputAmount > 100) return 2;
      if (inputAmount > 10) return 0.5;
      return 0.1;
    } catch (error) {
      console.error("Error calculating price impact:", error);
      return 0;
    }
  }
}

// SushiSwap Adaptörü (Uniswap V2 fork olduğu için aynı ABI'yi kullanabiliriz)
class SushiSwapAdapter extends UniswapV2Adapter {
  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    super(router, signer, routerAddress);
  }

  getName(): string {
    return "SushiSwap";
  }
}

// Monad Swap Adaptörü (Monad ağına özel bir DEX)
class MonadSwapAdapter implements LiquiditySourceAdapter {
  private router: ethers.Contract;
  private signer: ethers.Signer;
  private routerAddress: string;

  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    this.router = router;
    this.signer = signer;
    this.routerAddress = routerAddress;
  }

  getName(): string {
    return "MonadSwap";
  }

  async getQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<QuoteResult> {
    try {
      console.log(`${this.getName()} getQuote başlatılıyor:`, {
        tokenIn,
        tokenOut,
        amountIn
      });

      // MonadSwap'ın Uniswap V2 ile aynı arayüzü kullandığını varsayıyoruz
      const path = [tokenIn, tokenOut];
      const tokenInObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenIn.toLowerCase());
      const tokenOutObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenOut.toLowerCase());
      
      if (!tokenInObj || !tokenOutObj) {
        console.error(`Token bulunamadı: tokenIn=${!!tokenInObj}, tokenOut=${!!tokenOutObj}`);
        throw new Error("Token not found");
      }

      console.log(`${this.getName()} token bilgileri:`, {
        tokenInObj,
        tokenOutObj
      });

      const amountInWei = ethers.utils.parseUnits(amountIn, tokenInObj.decimals);
      console.log(`${this.getName()} router.getAmountsOut çağrılıyor:`, {
        amountInWei: amountInWei.toString(),
        path
      });
      
      // MonadSwap'ın kendi getAmountsOut fonksiyonunu çağırıyoruz
      const amounts = await this.router.getAmountsOut(amountInWei, path);
      console.log(`${this.getName()} getAmountsOut sonucu:`, {
        amounts: amounts.map((a: ethers.BigNumber) => a.toString())
      });

      const amountOutFormatted = ethers.utils.formatUnits(amounts[1], tokenOutObj.decimals);
      
      // Fiyat etkisi hesaplama - MonadSwap'a özel hesaplama yapılabilir
      const priceImpact = this.calculatePriceImpact(amountIn, amountOutFormatted);

      console.log(`${this.getName()} getQuote tamamlandı:`, {
        amountOut: amountOutFormatted,
        priceImpact
      });

      return {
        dexName: this.getName(),
        amountOut: amountOutFormatted,
        priceImpact,
        path
      };
    } catch (error) {
      console.error(`Error getting quote from ${this.getName()}:`, error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<ethers.providers.TransactionResponse> {
    const { tokenIn, tokenOut, amountIn, amountOutMin, recipient, deadline } = params;
    
    const tokenInObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenIn.toLowerCase());
    const tokenOutObj = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === tokenOut.toLowerCase());
    
    if (!tokenInObj || !tokenOutObj) {
      throw new Error("Token not found");
    }

    const amountInWei = ethers.utils.parseUnits(amountIn, tokenInObj.decimals);
    const amountOutMinWei = ethers.utils.parseUnits(amountOutMin, tokenOutObj.decimals);
    
    const path = [tokenIn, tokenOut];
    
    // Önce token onayını kontrol et
    const tokenContract = new ethers.Contract(
      tokenIn,
      [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
      ],
      this.signer
    );
    
    const signerAddress = await this.signer.getAddress();
    const allowance = await tokenContract.allowance(signerAddress, this.routerAddress);
    
    if (allowance.lt(amountInWei)) {
      const approveTx = await tokenContract.approve(
        this.routerAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
    }
    
    // MonadSwap'ın swap fonksiyonunu çağırıyoruz
    return this.router.swapExactTokensForTokens(
      amountInWei,
      amountOutMinWei,
      path,
      recipient,
      deadline
    );
  }

  private calculatePriceImpact(amountIn: string, amountOut: string): number {
    // Basit bir fiyat etkisi hesaplama
    const inputAmount = parseFloat(amountIn);
    
    if (inputAmount > 1000) return 3.5;
    if (inputAmount > 100) return 1.5;
    if (inputAmount > 10) return 0.3;
    return 0.05;
  }
}

// PancakeSwap Adaptörü
class PancakeSwapAdapter extends UniswapV2Adapter {
  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    super(router, signer, routerAddress);
  }

  getName(): string {
    return "PancakeSwap";
  }
}

// TraderJoe Adaptörü
class TraderJoeAdapter extends UniswapV2Adapter {
  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    super(router, signer, routerAddress);
  }

  getName(): string {
    return "TraderJoe";
  }
}

// Balancer Adaptörü
class BalancerAdapter implements LiquiditySourceAdapter {
  private router: ethers.Contract;
  private signer: ethers.Signer;
  private routerAddress: string;

  constructor(router: ethers.Contract, signer: ethers.Signer, routerAddress: string) {
    this.router = router;
    this.signer = signer;
    this.routerAddress = routerAddress;
  }

  getName(): string {
    return "Balancer";
  }

  async getQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<QuoteResult> {
    try {
      console.log(`${this.getName()} getQuote başlatılıyor:`, {
        tokenIn,
        tokenOut,
        amountIn
      });

      // Balancer'ın fiyat hesaplama mantığı farklı olabilir
      // Şimdilik basit bir simülasyon yapıyoruz
      const path = [tokenIn, tokenOut];
      
      // Balancer havuzlarında fiyat etkisi genellikle daha düşüktür
      const priceImpact = this.calculatePriceImpact(amountIn);
      
      // Çıkış miktarını hesapla (gerçek uygulamada Balancer kontratından alınmalı)
      const inputAmount = parseFloat(amountIn);
      let outputAmount = inputAmount;
      
      // Basit bir simülasyon: Balancer genellikle büyük işlemlerde daha iyi performans gösterir
      if (inputAmount > 100) {
        outputAmount = inputAmount * 0.998; // %0.2 fee
      } else {
        outputAmount = inputAmount * 0.997; // %0.3 fee
      }
      
      // Rastgele bir varyasyon ekle (gerçek hayatta farklı havuzlar farklı oranlar sunar)
      const variation = 1 + (Math.random() * 0.02 - 0.01); // ±%1 varyasyon
      outputAmount = outputAmount * variation;
      
      return {
        dexName: this.getName(),
        amountOut: outputAmount.toString(),
        priceImpact,
        path
      };
    } catch (error) {
      console.error(`${this.getName()} getQuote hatası:`, error);
      throw error;
    }
  }

  async executeSwap(params: SwapParams): Promise<ethers.providers.TransactionResponse> {
    try {
      console.log(`${this.getName()} executeSwap başlatılıyor:`, params);
      
      // Gerçek uygulamada Balancer kontratını çağırmalısınız
      // Şimdilik basit bir simülasyon yapıyoruz ve Uniswap router'ını kullanıyoruz
      
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 dakika
      
      const tx = await this.router.swapExactTokensForTokens(
        params.amountIn,
        params.amountOutMin,
        [params.tokenIn, params.tokenOut],
        params.recipient,
        deadline
      );
      
      console.log(`${this.getName()} swap işlemi gönderildi:`, tx.hash);
      return tx;
    } catch (error) {
      console.error(`${this.getName()} executeSwap hatası:`, error);
      throw error;
    }
  }
  
  private calculatePriceImpact(amountIn: string): number {
    // Balancer genellikle büyük işlemlerde daha düşük fiyat etkisine sahiptir
    const inputAmount = parseFloat(amountIn);
    
    if (inputAmount > 1000) return 2.8; // Uniswap'tan daha düşük
    if (inputAmount > 100) return 1.2;
    if (inputAmount > 10) return 0.25;
    return 0.04;
  }
}

// DEX Adaptör Factory
class DexAdapterFactory {
  static createAdapter(
    dexName: string, 
    provider: ethers.providers.Web3Provider,
    routerAddress: string,
    routerAbi: any
  ): LiquiditySourceAdapter | null {
    try {
      console.log(`DexAdapterFactory: ${dexName} adaptörü oluşturuluyor`, {
        routerAddress,
        abiLength: routerAbi.length
      });

      if (!routerAddress && dexName.toLowerCase() !== '1inch' && dexName.toLowerCase() !== '0x') {
        console.error(`${dexName} için router adresi bulunamadı`);
        return null;
      }

      const signer = provider.getSigner();
      const router = routerAddress ? new ethers.Contract(routerAddress, routerAbi, signer) : null;
      
      switch (dexName.toLowerCase()) {
        case 'uniswap':
          console.log("Uniswap adaptörü oluşturuluyor");
          return new UniswapV2Adapter(router!, signer, routerAddress);
        case 'sushiswap':
          console.log("SushiSwap adaptörü oluşturuluyor");
          return new SushiSwapAdapter(router!, signer, routerAddress);
        case 'monadswap':
          console.log("MonadSwap adaptörü oluşturuluyor");
          return new MonadSwapAdapter(router!, signer, routerAddress);
        case 'pancakeswap':
          console.log("PancakeSwap adaptörü oluşturuluyor");
          return new PancakeSwapAdapter(router!, signer, routerAddress);
        case 'traderjoe':
          console.log("TraderJoe adaptörü oluşturuluyor");
          return new TraderJoeAdapter(router!, signer, routerAddress);
        case 'balancer':
          console.log("Balancer adaptörü oluşturuluyor");
          return new BalancerAdapter(router!, signer, routerAddress);
        default:
          console.error(`Unknown DEX: ${dexName}`);
          return null;
      }
    } catch (error) {
      console.error(`DexAdapterFactory: ${dexName} adaptörü oluşturulurken hata:`, error);
      return null;
    }
  }
}

// DEX Konfigürasyonları
const DEX_CONFIGS = [
  {
    name: 'uniswap',
    routerAddress: CONTRACTS.ROUTER,
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  },
  // SushiSwap konfigürasyonu - Şu an için Uniswap ile aynı router'ı kullanıyoruz
  // Gerçek bir uygulamada, SushiSwap'in kendi router adresi kullanılmalıdır
  {
    name: 'sushiswap',
    routerAddress: CONTRACTS.ROUTER, // Gerçek SushiSwap router adresi ile değiştirilmeli
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  },
  // MonadSwap konfigürasyonu - Monad ağına özgü bir DEX
  {
    name: 'monadswap',
    routerAddress: CONTRACTS.ROUTER, // MonadSwap router adresi ile değiştirilmeli
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  },
  // PancakeSwap konfigürasyonu
  {
    name: 'pancakeswap',
    routerAddress: CONTRACTS.ROUTER, // Gerçek PancakeSwap router adresi ile değiştirilmeli
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  },
  // TraderJoe konfigürasyonu
  {
    name: 'traderjoe',
    routerAddress: CONTRACTS.ROUTER, // Gerçek TraderJoe router adresi ile değiştirilmeli
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  },
  // Balancer konfigürasyonu
  {
    name: 'balancer',
    routerAddress: CONTRACTS.ROUTER, // Gerçek Balancer router adresi ile değiştirilmeli
    routerAbi: [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ]
  }
  // Monad ağında başka DEX'ler olduğunda buraya eklenebilir
];

export function useDexAggregator() {
  const { router } = useUniswap();
  const [adapters, setAdapters] = useState<LiquiditySourceAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestRoute, setBestRoute] = useState<QuoteResult | null>(null);

  useEffect(() => {
    if (!window.ethereum) {
      console.log("window.ethereum bulunamadı, adaptörler oluşturulamıyor");
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("DEX adaptörleri oluşturuluyor...");
    
    // Tüm DEX'ler için adaptörler oluştur
    const dexAdapters = DEX_CONFIGS
      .map(config => {
        console.log(`${config.name} adaptörü oluşturuluyor`);
        
        // Diğer adaptörler için normal factory kullan
        try {
          const adapter = DexAdapterFactory.createAdapter(
            config.name,
            provider,
            config.routerAddress,
            config.routerAbi
          );
          console.log(`${config.name} adaptörü başarıyla oluşturuldu`);
          return adapter;
        } catch (error) {
          console.error(`${config.name} adaptörü oluşturulurken hata:`, error);
          return null;
        }
      }).filter(adapter => adapter !== null) as LiquiditySourceAdapter[];
    
    console.log("Oluşturulan adaptörler:", dexAdapters.map(a => a.getName()));
    setAdapters(dexAdapters);
    setLoading(false);
  }, [router]);

  // En iyi fiyat teklifini al
  const getBestQuote = async (tokenIn: string, tokenOut: string, amountIn: string): Promise<QuoteResult | null> => {
    if (adapters.length === 0 || !amountIn || parseFloat(amountIn) <= 0) {
      return null;
    }

    try {
      // Tüm adaptörlerden fiyat teklifi al
      const quotesPromises = adapters.map(adapter => 
        adapter.getQuote(tokenIn, tokenOut, amountIn)
          .catch(error => {
            console.error(`Error getting quote from ${adapter.getName()}:`, error);
            return null;
          })
      );
      
      // Paralel olarak tüm teklifleri al
      const quotes = await Promise.all(quotesPromises);

      // Geçerli teklifleri filtrele
      const validQuotes = quotes.filter(quote => quote !== null) as QuoteResult[];
      
      if (validQuotes.length === 0) {
        return null;
      }

      // En iyi teklifi bul (en yüksek çıkış miktarı)
      const bestQuote = validQuotes.reduce((best, current) => {
        const bestAmount = parseFloat(best.amountOut);
        const currentAmount = parseFloat(current.amountOut);
        return currentAmount > bestAmount ? current : best;
      }, validQuotes[0]);

      setBestRoute(bestQuote);
      return bestQuote;
    } catch (error) {
      console.error("Error getting best quote:", error);
      return null;
    }
  };

  // Swap işlemini gerçekleştir
  const executeSwap = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number = 0.5
  ): Promise<ethers.providers.TransactionResponse | null> => {
    if (!bestRoute || adapters.length === 0) {
      return null;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        throw new Error("No connected account");
      }

      const recipient = accounts[0];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 dakika
      
      // Slippage hesaplama
      const amountOut = bestRoute.amountOut;
      const amountOutMin = (parseFloat(amountOut) * (1 - slippage / 100)).toString();
      
      // Hangi adaptörün kullanılacağını belirle
      const adapter = adapters.find(a => a.getName() === bestRoute.dexName);
      
      if (!adapter) {
        throw new Error(`Adapter for ${bestRoute.dexName} not found`);
      }
      
      // Swap işlemini gerçekleştir
      return adapter.executeSwap({
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        recipient,
        deadline
      });
    } catch (error) {
      console.error("Error executing swap:", error);
      return null;
    }
  };

  return {
    loading,
    adapters,
    bestRoute,
    getBestQuote,
    executeSwap
  };
} 