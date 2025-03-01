import { ethers } from 'ethers';

export const TOKEN_SWAP_ABI = [
  "function swap(uint256 amount) external",
  "function getSwapRate() external view returns (uint256)",
  "function token1() external view returns (address)",
  "function token2() external view returns (address)",
  "event Swap(address indexed user, uint256 token1Amount, uint256 token2Amount)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export interface TokenSwapContract {
  swap: (amount: ethers.BigNumber) => Promise<ethers.ContractTransaction>;
  getSwapRate: () => Promise<ethers.BigNumber>;
  token1: () => Promise<string>;
  token2: () => Promise<string>;
}

export interface ERC20Contract {
  approve: (spender: string, amount: ethers.BigNumber) => Promise<ethers.ContractTransaction>;
  allowance: (owner: string, spender: string) => Promise<ethers.BigNumber>;
  balanceOf: (account: string) => Promise<ethers.BigNumber>;
  decimals: () => Promise<number>;
  symbol: () => Promise<string>;
  name: () => Promise<string>;
} 