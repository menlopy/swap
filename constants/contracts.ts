export const MONAD_CHAIN_ID = '0x279f'; // Monad Testnet Chain ID
export const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz'; // Monad Testnet RPC URL

export const CONTRACTS = {
  FACTORY: '0xd0ec37a8CcF6d90692F22548ad1b79B63CC6734f',
  ROUTER: '0x8eceC8132ebB3BeA5dCfB9fd2d33fF9a0DC9242D',
  TOKENS: {
    MONAD: {
      address: '0x62D1040C7584feFB31a554B5970bbF34A838eDa2',
      decimals: 18,
      symbol: 'MONAD',
      name: 'Monad Token',
      logoURI: 'https://www.monad.xyz/monad.svg',
    },
    WETH: {
      address: '0xf14d8131e66c33C6bA481c7941D682A37a2da98F',
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    },
    SRT1: {
      address: '0x08EB313361351c2EE74Ef4E49198c76508521ceD',
      decimals: 18,
      symbol: 'SRT',
      name: 'Staking Reward Token',
      logoURI: '',
    },
    SRT2: {
      address: '0xC866d9729794b8ddF72d18DcAA00f2f2BAE54162',
      decimals: 18,
      symbol: 'SRT',
      name: 'Staking Reward Token',
      logoURI: '',
    },
  },
};

export const SUPPORTED_TOKENS = Object.values(CONTRACTS.TOKENS).map(token => ({
  ...token,
  balance: '0.0',
}));

export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 50; // 50%
export const PRICE_UPDATE_INTERVAL = 10000; // 10 seconds
export const GAS_LIMIT_MULTIPLIER = 1.2; // 20% buffer for gas limit estimation

// Contract Addresses
export const USER_XP_CONTRACT_ADDRESS = '0x15320fFE0584F36c18c408210e0f530E8E9d2317';
export const STAKING_TOKEN_ADDRESS = '0xC866d9729794b8ddF72d18DcAA00f2f2BAE54162';
export const PAIR_ADDRESS = '0x6e9d2c2B780F2798b45569fb548B799c41B637BE'; 