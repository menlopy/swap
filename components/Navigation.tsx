import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import XPBadge from './XPBadge';
import { USER_XP_CONTRACT_ADDRESS } from '../constants/contracts';

interface NavigationProps {
  account: string | null;
  isConnecting: boolean;
  onWalletClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  account,
  isConnecting,
  onWalletClick,
}) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="relative z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MONAD
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`transition-colors ${
                currentPath === '/'
                  ? 'text-white hover:text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Swap
            </Link>
            <Link
              href="/staking"
              className={`transition-colors ${
                currentPath === '/staking'
                  ? 'text-white hover:text-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Staking
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

          {/* XP Badge and Wallet Button */}
          <div className="flex items-center gap-4">
            {account && (
              <XPBadge account={account} userXPAddress={USER_XP_CONTRACT_ADDRESS} />
            )}
            
            <button
              onClick={onWalletClick}
              disabled={isConnecting}
              className={`px-4 py-2 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                account
                  ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : account ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 