import { ethers } from 'ethers';
import { MONAD_RPC_URL, CONTRACTS, SUPPORTED_TOKENS } from '../constants/contracts';

// Monad test tokens - These are example addresses, replace with actual test token addresses
const MONAD_TEST_TOKENS = [
  {
    address: '0x62D1040C7584feFB31a554B5970bbF34A838eDa2', // MONAD Token
    decimals: 18,
    symbol: 'MONAD',
    name: 'Monad Token',
    logoURI: 'https://www.monad.xyz/monad.svg',
  },
  {
    address: '0xf14d8131e66c33C6bA481c7941D682A37a2da98F', // WETH
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    address: '0x08EB313361351c2EE74Ef4E49198c76508521ceD', // Staking Token
    decimals: 18,
    symbol: 'SRT',
    name: 'Staking Reward Token',
    logoURI: '',
  },
  {
    address: '0xC866d9729794b8ddF72d18DcAA00f2f2BAE54162', // From .env STAKING_TOKEN_ADDRESS
    decimals: 18,
    symbol: 'SRT',
    name: 'Staking Reward Token',
    logoURI: '',
  }
];

// Custom tokens added by the user
let CUSTOM_TOKENS: any[] = [];

// ERC20 ABI for token detection
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

// Function to check if a token exists at the given address
export async function isValidToken(address: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL);
    const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
    
    // Try to call basic ERC20 functions to verify it's a token
    await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    
    return true;
  } catch (error) {
    console.error(`Invalid token address: ${address}`, error);
    return false;
  }
}

// Function to get token details
export async function getTokenDetails(address: string, account?: string): Promise<any> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL);
    const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
    
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    
    let balance = '0.0';
    if (account) {
      const balanceWei = await tokenContract.balanceOf(account);
      balance = ethers.utils.formatUnits(balanceWei, decimals);
    }
    
    return {
      address,
      name,
      symbol,
      decimals,
      balance,
      logoURI: '' // Default empty logo
    };
  } catch (error) {
    console.error(`Error getting token details for ${address}:`, error);
    return null;
  }
}

// Function to add a custom token
export async function addCustomToken(address: string, account?: string): Promise<any> {
  try {
    // Check if token is valid
    const isValid = await isValidToken(address);
    if (!isValid) {
      throw new Error('Invalid token address');
    }
    
    // Get token details
    const tokenDetails = await getTokenDetails(address, account);
    if (!tokenDetails) {
      throw new Error('Failed to get token details');
    }
    
    // Check if token already exists
    const exists = [...SUPPORTED_TOKENS, ...MONAD_TEST_TOKENS, ...CUSTOM_TOKENS].some(
      t => t.address.toLowerCase() === address.toLowerCase()
    );
    
    if (exists) {
      throw new Error('Token already exists in the list');
    }
    
    // Add to custom tokens
    CUSTOM_TOKENS.push(tokenDetails);
    
    return tokenDetails;
  } catch (error) {
    console.error('Error adding custom token:', error);
    throw error;
  }
}

// Function to get all available tokens including test tokens
export async function getAllTokens(account?: string): Promise<any[]> {
  // Start with the supported tokens from constants
  const allTokens = [...SUPPORTED_TOKENS];
  const existingSymbols = new Set(allTokens.map(t => t.symbol));
  
  // Add Monad test tokens
  for (const token of [...MONAD_TEST_TOKENS, ...CUSTOM_TOKENS]) {
    // Check if token already exists in the list by address
    const existsByAddress = allTokens.some(t => t.address.toLowerCase() === token.address.toLowerCase());
    
    // Check if token already exists by symbol (to avoid duplicates with same symbol)
    const existsBySymbol = existingSymbols.has(token.symbol);
    
    if (!existsByAddress && !existsBySymbol) {
      try {
        // Verify token is valid
        const isValid = await isValidToken(token.address);
        if (isValid) {
          // Get token details including balance if account is provided
          const tokenDetails = await getTokenDetails(token.address, account);
          if (tokenDetails) {
            allTokens.push(tokenDetails);
            existingSymbols.add(tokenDetails.symbol);
          }
        }
      } catch (error) {
        console.error(`Error processing token ${token.symbol}:`, error);
        // Continue with other tokens even if one fails
      }
    }
  }
  
  return allTokens;
}

// Function to update token balances
export async function updateTokenBalances(tokens: any[], account: string): Promise<any[]> {
  if (!account) return tokens;
  
  const updatedTokens = await Promise.all(
    tokens.map(async (token) => {
      try {
        const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL);
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balanceWei = await tokenContract.balanceOf(account);
        const balance = ethers.utils.formatUnits(balanceWei, token.decimals);
        
        return {
          ...token,
          balance
        };
      } catch (error) {
        console.error(`Error updating balance for ${token.symbol}:`, error);
        return token;
      }
    })
  );
  
  return updatedTokens;
} 