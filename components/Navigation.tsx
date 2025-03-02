import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import XPBadge from './XPBadge';
import { USER_XP_CONTRACT_ADDRESS } from '../constants/contracts';
import { formatAddress } from '../utils/web3';

interface NavigationProps {
  account: string | null;
  isConnecting: boolean;
  onWalletClick: () => void;
  setAccount: Dispatch<SetStateAction<string | null>>;
}

const Navigation: React.FC<NavigationProps> = ({
  account,
  isConnecting,
  onWalletClick,
  setAccount,
}) => {
  const router = useRouter();
  const currentPath = router.pathname;

  // Direct disconnect function
  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Disconnect wallet by setting account to null
    setAccount(null);
  };

  return (
    <nav className="relative z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-1">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <img 
                    src="/monad-logo.png" 
                    alt="MonaDEX Logo" 
                    width={32} 
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                  MonaDEX
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="flex-1 flex items-center justify-center gap-8">
            <Link href="/">
              <span className={`transition-colors ${
                currentPath === '/'
                  ? 'text-white hover:text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}>
                Swap
              </span>
            </Link>
            <Link href="/staking">
              <span className={`transition-colors ${
                currentPath === '/staking'
                  ? 'text-white hover:text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}>
                Staking
              </span>
            </Link>
            <Link href="/perpetual">
              <span className={`transition-colors ${
                currentPath === '/perpetual'
                  ? 'text-white hover:text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}>
                Perpetual
              </span>
            </Link>
            <a
              href="https://docs.monorail.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Docs
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>

          {/* XP Badge and Wallet Buttons */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {account && (
              <XPBadge account={account} userXPAddress={USER_XP_CONTRACT_ADDRESS} />
            )}
            
            {isConnecting ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl text-white font-medium bg-[#2a2a2a] opacity-50 cursor-not-allowed flex items-center gap-2"
              >
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </button>
            ) : account ? (
              <div className="flex items-center gap-2">
                {/* Wallet Info Button - Clicking this will trigger wallet switch */}
                <button
                  onClick={onWalletClick}
                  className="px-4 py-2 rounded-xl text-white font-medium bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                  title="Click to switch wallet"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {formatAddress(account)}
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
                
                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="p-2 rounded-xl text-red-400 bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
                  title="Disconnect Wallet"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={onWalletClick}
                className="px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 