import React, { useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  tokenIn: {
    symbol: string;
    amount: string;
    address: string;
  };
  tokenOut: {
    symbol: string;
    amount: string;
    address: string;
  };
  dex: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface TransactionHistoryProps {
  account: string | null;
}

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#202020] transition-all duration-200 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-500/10">
            <ArrowsRightLeftIcon className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-white font-medium">Swap on {transaction.dex}</span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-sm text-gray-400">{formatTime(transaction.timestamp)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-400 text-sm">From</div>
          <div className="text-white font-medium">{transaction.tokenIn.amount} {transaction.tokenIn.symbol}</div>
        </div>
        <ArrowPathIcon className="h-4 w-4 text-gray-500 mx-2" />
        <div className="text-right">
          <div className="text-gray-400 text-sm">To</div>
          <div className="text-white font-medium">{transaction.tokenOut.amount} {transaction.tokenOut.symbol}</div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 truncate">
        <a 
          href={`https://explorer.monad.xyz/tx/${transaction.hash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          {transaction.hash}
        </a>
      </div>
    </div>
  );
};

const TransactionHistory = ({ account }: TransactionHistoryProps) => {
  // Placeholder for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  if (!account) {
    return (
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-medium text-white mb-4">Transaction History</h3>
        <div className="text-center py-8 text-gray-400">
          Connect your wallet to view transaction history
        </div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-medium text-white mb-4">Transaction History</h3>
        <div className="text-center py-8 text-gray-400">
          No transactions yet
        </div>
      </div>
    );
  }
  
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);
  
  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white">Transaction History</h3>
        {transactions.length > 0 && (
          <button 
            onClick={() => setTransactions([])}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {displayedTransactions.map((tx) => (
          <TransactionItem key={tx.hash} transaction={tx} />
        ))}
      </div>
      
      {transactions.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAll ? 'Show Less' : `Show All (${transactions.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 