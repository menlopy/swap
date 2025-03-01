import { useState } from 'react';
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface Transaction {
  hash: string;
  type: 'SWAP' | 'APPROVE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  from: {
    symbol: string;
    amount: string;
  };
  to?: {
    symbol: string;
    amount: string;
  };
}

const TransactionHistory = () => {
  const [transactions] = useState<Transaction[]>([
    {
      hash: '0x1234...5678',
      type: 'SWAP',
      status: 'COMPLETED',
      timestamp: Date.now() - 300000,
      from: { symbol: 'MONAD', amount: '100' },
      to: { symbol: 'WETH', amount: '0.05' },
    },
    {
      hash: '0x8765...4321',
      type: 'APPROVE',
      status: 'PENDING',
      timestamp: Date.now() - 600000,
      from: { symbol: 'WETH', amount: '∞' },
    },
  ]);

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        );
    }
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-medium text-white mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Your transactions will appear here
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.hash}
              className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#202020] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(tx.status)}
                  <span className="text-white font-medium">
                    {tx.type === 'SWAP' ? 'Swap' : 'Approve'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {formatTime(tx.timestamp)}
                  <a
                    href={`https://explorer.monad.xyz/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="text-sm">
                {tx.type === 'SWAP' ? (
                  <div className="flex items-center gap-1 text-gray-300">
                    <span>{tx.from.amount} {tx.from.symbol}</span>
                    <span className="text-gray-500 mx-1">→</span>
                    <span>{tx.to?.amount} {tx.to?.symbol}</span>
                  </div>
                ) : (
                  <div className="text-gray-300">
                    Approve {tx.from.symbol} for trading
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 