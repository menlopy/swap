import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_TOKENS } from '../constants/contracts';

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
}

const TokenSelectModal = ({ isOpen, onClose, onSelect, selectedToken }: TokenSelectModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTokens, setFilteredTokens] = useState(SUPPORTED_TOKENS);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTokens(SUPPORTED_TOKENS);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = SUPPORTED_TOKENS.filter(
      token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
    );
    setFilteredTokens(filtered);
  }, [searchQuery]);

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
                  className="text-xl font-medium leading-6 text-white mb-4"
                >
                  Select a token
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

                <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.address}
                      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200 ${
                        selectedToken?.address === token.address ? 'bg-[#2a2a2a]' : ''
                      }`}
                      onClick={() => {
                        onSelect(token);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {token.symbol.charAt(0)}
                          </div>
                        )}
                        <div className="text-left">
                          <div className="text-white font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        {token.balance}
                      </div>
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TokenSelectModal; 