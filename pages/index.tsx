import type { NextPage } from 'next';
import Head from 'next/head';
import SwapInterface from '../components/SwapInterface';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { walletManager } from '../utils/web3';

const Home: NextPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

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
        <title>MonaDEX - Swap</title>
        <meta name="description" content="Swap tokens on Monad Network" />
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
          <SwapInterface />
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

export default Home; 