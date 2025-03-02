import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PerpetualComingSoon: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Perpetual Trading - Coming Soon | MonaDEX</title>
        <meta name="description" content="Perpetual trading features coming soon to MonaDEX" />
      </Head>

      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl w-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-8 rounded-2xl border border-gray-800 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Perpetual Trading
            </h1>
            <div className="flex justify-center mb-6">
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              We're working hard to bring you advanced perpetual trading features on MonaDEX.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#222222] p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Leverage Trading</h3>
              </div>
              <p className="text-gray-400">
                Trade with up to 100x leverage on a wide range of crypto assets with low fees and deep liquidity.
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Advanced Risk Management</h3>
              </div>
              <p className="text-gray-400">
                Set stop-loss, take-profit, and trailing stops to manage your positions with precision.
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Real-time Analytics</h3>
              </div>
              <p className="text-gray-400">
                Access advanced charts, market data, and position analytics to make informed trading decisions.
              </p>
            </div>

            <div className="bg-[#222222] p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Low Fees</h3>
              </div>
              <p className="text-gray-400">
                Enjoy competitive trading fees with additional discounts for platform token holders.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
            >
              Back to Swap
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Want to be notified when Perpetual Trading launches?
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl focus:border-purple-500 outline-none"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerpetualComingSoon; 