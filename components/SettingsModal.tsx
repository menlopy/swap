import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  onSlippageChange: (value: number) => void;
}

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

const SettingsModal = ({ isOpen, onClose, slippage, onSlippageChange }: SettingsModalProps) => {
  const [customSlippage, setCustomSlippage] = useState('');

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      onSlippageChange(numValue);
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
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-white"
                  >
                    Settings
                  </Dialog.Title>
                  <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Slippage Tolerance
                    </label>
                    <div className="flex gap-2">
                      {SLIPPAGE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                            slippage === preset
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                          }`}
                          onClick={() => onSlippageChange(preset)}
                        >
                          {preset}%
                        </button>
                      ))}
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={customSlippage}
                          onChange={(e) => handleCustomSlippageChange(e.target.value)}
                          placeholder="Custom"
                          className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                        />
                        <span className="absolute right-3 top-2 text-gray-400">%</span>
                      </div>
                    </div>
                  </div>

                  {parseFloat(customSlippage) > 5 && (
                    <div className="text-yellow-500 text-sm bg-yellow-500/10 p-3 rounded-xl">
                      ⚠️ Your transaction may be frontrun due to high slippage tolerance
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsModal; 