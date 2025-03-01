import React from 'react';

const DEXStats = () => {
  // DEX istatistikleri için örnek veriler
  const stats = {
    totalVolume: '$12.5M',
    dailyVolume: '$1.2M',
    totalTrades: '45,678',
    activePairs: '24',
    topPairs: [
      { name: 'MONAD/WETH', volume: '$450K', change: '+5.2%', positive: true },
      { name: 'MONAD/USDC', volume: '$320K', change: '+3.8%', positive: true },
      { name: 'WETH/USDC', volume: '$280K', change: '-1.2%', positive: false },
    ]
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-medium text-white mb-4">DEX Overview</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">Total Volume</div>
          <div className="text-xl font-bold text-white">{stats.totalVolume}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">24h Volume</div>
          <div className="text-xl font-bold text-white">{stats.dailyVolume}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">Total Trades</div>
          <div className="text-xl font-bold text-white">{stats.totalTrades}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
          <div className="text-sm text-gray-400 mb-1">Active Pairs</div>
          <div className="text-xl font-bold text-white">{stats.activePairs}</div>
        </div>
      </div>

      {/* Top Pairs */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Top Trading Pairs</h4>
        <div className="space-y-3">
          {stats.topPairs.map((pair, index) => (
            <div key={index} className="bg-[#1a1a1a] rounded-xl p-4 hover:bg-[#202020] transition-all duration-200 border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                      {pair.name.split('/')[0].charAt(0)}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs absolute -bottom-1 -right-1 border-2 border-[#1a1a1a]">
                      {pair.name.split('/')[1].charAt(0)}
                    </div>
                  </div>
                  <span className="text-white font-medium">{pair.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{pair.volume}</div>
                  <div className={`text-xs ${pair.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {pair.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DEXStats; 