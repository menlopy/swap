import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_TOKENS } from '../constants/contracts';
import { getAllTokens, updateTokenBalances, addCustomToken } from '../utils/tokenList';
import { ethers } from 'ethers';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  logoURI?: string;
  decimals: number;
}

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
  account?: string;
}

const TokenSelectModal = ({ isOpen, onClose, onSelect, selectedToken, account }: TokenSelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [isAddingCustomToken, setIsAddingCustomToken] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [addTokenError, setAddTokenError] = useState('');
  const [error, setError] = useState('');

  // Fetch all tokens including test tokens when modal opens
  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        console.log("Token listesi yükleniyor...");
        const allTokens = await getAllTokens(account);
        console.log("Yüklenen tokenler:", allTokens);
        setAllTokens(allTokens);
        setFilteredTokens(allTokens);
      } catch (error) {
        console.error("Token listesi yüklenirken hata:", error);
        setError("Failed to load tokens. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadTokens();
    }
  }, [isOpen, account]);

  // Filter tokens based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTokens(allTokens);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allTokens.filter(
      token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
    );
    setFilteredTokens(filtered);
  }, [searchQuery, allTokens]);

  // Update token balances when account changes
  useEffect(() => {
    if (account && allTokens.length > 0) {
      updateTokenBalances(allTokens, account).then(updatedTokens => {
        setAllTokens(updatedTokens);
        setFilteredTokens(updatedTokens);
      });
    }
  }, [account]);

  // Handle adding a custom token
  const handleAddCustomToken = async () => {
    if (!ethers.utils.isAddress(customTokenAddress)) {
      setAddTokenError('Please enter a valid token address');
      return;
    }

    setIsAddingToken(true);
    setAddTokenError('');

    try {
      console.log("Özel token ekleniyor:", customTokenAddress);
      const newToken = await addCustomToken(customTokenAddress, account);
      console.log("Eklenen token:", newToken);
      
      // Refresh the token list
      const allTokens = await getAllTokens(account);
      console.log("Güncellenmiş token listesi:", allTokens);
      setAllTokens(allTokens);
      setFilteredTokens(allTokens);
      
      // Reset the form
      setCustomTokenAddress('');
      setIsAddingToken(false);
      
      // Select the newly added token
      onSelect(newToken);
      onClose();
    } catch (error) {
      console.error("Özel token eklenirken hata:", error);
      setAddTokenError(error instanceof Error ? error.message : 'Failed to add token');
      setIsAddingToken(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6 text-left align-middle shadow-xl transition-all border border-gray-800">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-white mb-4 flex justify-between items-center"
                >
                  <span>Select a token</span>
                </Dialog.Title>

                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or paste address"
                    className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Token List */}
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredTokens.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">
                      No tokens found
                    </div>
                  ) : (
                    filteredTokens.map((token) => (
                      <button
                        key={token.address}
                        onClick={() => {
                          onSelect(token);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3 hover:bg-[#2a2a2a] rounded-xl mb-2 transition-colors ${
                          selectedToken?.address === token.address ? 'bg-[#2a2a2a]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {token.logoURI ? (
                            <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                              {token.symbol.charAt(0)}
                            </div>
                          )}
                          <div className="text-left">
                            <div className="text-white font-medium">{token.symbol}</div>
                            <div className="text-gray-400 text-sm">{token.name}</div>
                          </div>
                        </div>
                        {token.balance && (
                          <div className="text-right">
                            <div className="text-white">{parseFloat(token.balance).toFixed(4)}</div>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Add Custom Token Button */}
                {!isAddingCustomToken ? (
                  <button
                    onClick={() => setIsAddingCustomToken(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl text-white transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Custom Token
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-[#2a2a2a] rounded-xl">
                    <h3 className="text-white font-medium mb-2">Add Custom Token</h3>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={customTokenAddress}
                        onChange={(e) => setCustomTokenAddress(e.target.value)}
                        placeholder="Token Address (0x...)"
                        className="w-full p-3 bg-[#1a1a1a] rounded-xl text-white outline-none"
                      />
                      {addTokenError && (
                        <div className="text-red-500 text-sm">{addTokenError}</div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setIsAddingCustomToken(false)}
                          className="flex-1 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-xl text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddCustomToken}
                          disabled={isAddingToken}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
                        >
                          {isAddingToken ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : (
                            'Add Token'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TokenSelectModal; 