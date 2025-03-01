import type { NextPage } from 'next';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { walletManager } from '../utils/web3';

const Staking: NextPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [rewardAmount, setRewardAmount] = useState('0');
  const [stakingPeriod, setStakingPeriod] = useState('7');

  // Cüzdan bağlantısını yönet
  useEffect(() => {
    // Sayfa yüklendiğinde mevcut hesabı kontrol et
    const checkCurrentAccount = async () => {
      const currentAccount = await walletManager.getCurrentAccount();
      setAccount(currentAccount);
    };
    
    checkCurrentAccount();
    
    // Hesap değişikliklerini dinle
    walletManager.setAccountChangeCallback((newAccount) => {
      setAccount(newAccount);
    });
    
    // Provider'ı başlat
    walletManager.initProvider();
    
  }, []);

  const handleWalletClick = async () => {
    try {
      setIsConnecting(true);
      
      if (account) {
        // Eğer zaten bağlıysa, cüzdan değiştirme işlemini başlat
        const newAccount = await walletManager.switchWallet();
        setAccount(newAccount);
      } else {
        // Bağlı değilse, yeni bağlantı kur
        const newAccount = await walletManager.connectWallet();
        setAccount(newAccount);
      }
    } catch (error) {
      console.error('Wallet interaction failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Cüzdanı ayır
  const disconnectWallet = () => {
    walletManager.disconnectWallet();
    setAccount(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse" />
          <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-75" />
          <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-150" />
        </div>
      </div>

      <Head>
        <title>Monad Staking</title>
        <meta name="description" content="Stake LP tokens on Monad Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation
        account={account}
        isConnecting={isConnecting}
        onWalletClick={handleWalletClick}
        setAccount={disconnectWallet}
      />

      <div className="relative">
        {/* Main content */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto bg-[#1a1a1a] rounded-2xl p-6 shadow-xl">
            <h1 className="text-2xl font-bold mb-6">Stake LP Tokens</h1>
            
            {/* Staking Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#2a2a2a] rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">Total Staked</div>
                <div className="text-xl font-bold">{stakedAmount} LP</div>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
                <div className="text-xl font-bold">{rewardAmount} SRT</div>
              </div>
            </div>

            {/* Staking Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount to Stake</label>
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Staking Period</label>
                <select
                  value={stakingPeriod}
                  onChange={(e) => setStakingPeriod(e.target.value)}
                  className="w-full bg-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">7 Days (1x Rewards)</option>
                  <option value="30">30 Days (1.5x Rewards)</option>
                  <option value="90">90 Days (2x Rewards)</option>
                  <option value="180">180 Days (3x Rewards)</option>
                </select>
              </div>

              <button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity rounded-xl px-4 py-3 text-white font-medium"
              >
                Stake LP Tokens
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-auto">
          <div className="text-center text-gray-400 text-sm">
            Built with ❤️ for the Monad Network
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Staking; 