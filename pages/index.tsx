import type { NextPage } from 'next';
import Head from 'next/head';
import SwapInterface from '../components/SwapInterface';
import Navigation from '../components/Navigation';
import { useState, useEffect } from 'react';
import { switchToMonadNetwork } from '../utils/web3';

const Home: NextPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleWalletClick = async () => {
    if (account) {
      // If already connected, disconnect
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }]
        });
      } catch (error) {
        console.error('Failed to disconnect wallet:', error);
      }
      setAccount(null);
      return;
    }

    if (!window.ethereum) {
      alert('Please install MetaMask to use this app');
      return;
    }

    try {
      setIsConnecting(true);
      // Switch to Monad network first
      await switchToMonadNetwork();
      
      // Force MetaMask to show account selection
      const accounts = await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      }).then(() => window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }));
      
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
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
        <title>Monad Token Swap</title>
        <meta name="description" content="Swap tokens on Monad Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation
        account={account}
        isConnecting={isConnecting}
        onWalletClick={handleWalletClick}
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