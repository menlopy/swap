import { ethers } from 'ethers';
import { MONAD_CHAIN_ID, MONAD_RPC_URL } from '../constants/contracts';

/**
 * Monad ağına geçiş yapmayı dener
 */
export async function switchToMonadNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_CHAIN_ID }],
    });
    return true;
  } catch (switchError: any) {
    // Bu hata kodu, zincirin MetaMask'a eklenmediğini gösterir
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

/**
 * Cüzdan bağlantı yöneticisi
 * Basit ve doğrudan bir yaklaşım kullanarak cüzdan bağlantısını yönetir
 */
export class WalletManager {
  private provider: ethers.providers.Web3Provider | null = null;
  private onAccountChange: ((account: string | null) => void) | null = null;
  private onNetworkChange: ((chainId: string) => void) | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Event listener'ları ayarlar
   */
  private setupEventListeners() {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Hesap değişikliklerini dinle
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (this.onAccountChange) {
          this.onAccountChange(accounts.length > 0 ? accounts[0] : null);
        }
      });

      // Ağ değişikliklerini dinle
      window.ethereum.on('chainChanged', (chainId: string) => {
        if (this.onNetworkChange) {
          this.onNetworkChange(chainId);
        }
      });
    }
  }

  /**
   * Provider'ı başlatır
   */
  public initProvider(): ethers.providers.Web3Provider | null {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      return this.provider;
    }
    return null;
  }

  /**
   * Hesap değişikliği callback'ini ayarlar
   */
  public setAccountChangeCallback(callback: (account: string | null) => void) {
    this.onAccountChange = callback;
  }

  /**
   * Ağ değişikliği callback'ini ayarlar
   */
  public setNetworkChangeCallback(callback: (chainId: string) => void) {
    this.onNetworkChange = callback;
  }

  /**
   * Mevcut bağlı hesabı alır
   */
  public async getCurrentAccount(): Promise<string | null> {
    if (!window.ethereum) return null;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  /**
   * Cüzdanı bağlar
   * Eğer zaten bağlıysa, mevcut hesabı döndürür
   */
  public async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      alert('MetaMask yüklü değil. Lütfen MetaMask yükleyin ve tekrar deneyin.');
      return null;
    }

    try {
      // Önce Monad ağına geçiş yap
      await switchToMonadNetwork();
      
      // Hesap izni iste
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      return null;
    }
  }

  /**
   * Cüzdanı değiştirir
   * Mevcut bağlantıyı temizler ve yeni bir bağlantı isteği gönderir
   */
  public async switchWallet(): Promise<string | null> {
    if (!window.ethereum) return null;
    
    try {
      // Önce Monad ağına geçiş yap
      await switchToMonadNetwork();
      
      // Mevcut hesabı temizle (localStorage'dan)
      localStorage.removeItem('walletConnected');
      
      // Yeni bir bağlantı isteği gönder
      // Bu, MetaMask'ın hesap seçim diyaloğunu göstermesini sağlar
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error('Error switching wallet:', error);
      return null;
    }
  }

  /**
   * Cüzdanı ayırır
   */
  public disconnectWallet(): void {
    // MetaMask API'si doğrudan bağlantıyı kesme yöntemi sunmaz
    // Bu nedenle, sadece uygulama tarafında bağlantıyı kesiyoruz
    localStorage.removeItem('walletConnected');
    
    if (this.onAccountChange) {
      this.onAccountChange(null);
    }
  }
}

// Singleton instance
export const walletManager = new WalletManager();

// Yardımcı fonksiyonlar
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