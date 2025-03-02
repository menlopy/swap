import { ethers } from 'ethers';

export const UNISWAP_V2_FACTORY_ABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

export const UNISWAP_V2_ROUTER_ABI = [
  // Liquidity functions
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
  
  // Swap functions
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  
  // Quote functions
  "function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB)",
  "function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut)",
  "function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)"
];

export const UNISWAP_V2_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() external view returns (uint)",
  "function balanceOf(address owner) external view returns (uint)",
  "function approve(address spender, uint value) external returns (bool)",
  "function transfer(address to, uint value) external returns (bool)",
  "function transferFrom(address from, address to, uint value) external returns (bool)"
];

// Monad ağı için Uniswap adresleri
export const UNISWAP_ADDRESSES = {
  FACTORY: '0xd0ec37a8CcF6d90692F22548ad1b79B63CC6734f',
  ROUTER: '0x8eceC8132ebB3BeA5dCfB9fd2d33fF9a0DC9242D',
  INIT_CODE_HASH: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' // UniswapV2 default
}; 