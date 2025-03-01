export const MONAD_CHAIN_ID = '0x1'; // Using Ethereum mainnet for testing
export const MONAD_RPC_URL = 'https://mainnet.infura.io/v3/your-project-id'; // Replace with your Infura project ID

export const CONTRACTS = {
  SWAP: '0x0000000000000000000000000000000000000001', // Placeholder address
  TOKENS: {
    MONAD: {
      address: '0x0000000000000000000000000000000000000002',
      decimals: 18,
      symbol: 'MONAD',
      name: 'Monad Token',
      logoURI: '/tokens/monad.png',
    },
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Real WETH address
      decimals: 18,
      symbol: 'WETH',
      name: 'Wrapped Ether',
      logoURI: '/tokens/weth.png',
    },
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Real USDC address
      decimals: 6,
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: '/tokens/usdc.png',
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Real USDT address
      decimals: 6,
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: '/tokens/usdt.png',
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
export const USER_XP_CONTRACT_ADDRESS = '0x...'; // Replace with the actual deployed contract address 