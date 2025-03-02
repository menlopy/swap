import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
  const MONAD_TOKEN_ADDRESS = process.env.MONAD_TOKEN_ADDRESS;
  const WETH_ADDRESS = process.env.WETH_ADDRESS;
  const PAIR_ADDRESS = process.env.PAIR_ADDRESS;

  console.log("Checking pair with the following addresses:");
  console.log("Factory:", FACTORY_ADDRESS);
  console.log("MONAD Token:", MONAD_TOKEN_ADDRESS);
  console.log("WETH:", WETH_ADDRESS);
  console.log("Expected Pair:", PAIR_ADDRESS);

  // Connect to the factory contract
  const factoryABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"
  ];
  
  const pairABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
  ];

  const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const factory = new ethers.Contract(FACTORY_ADDRESS!, factoryABI, provider);

  // Get the pair address
  const actualPairAddress = await factory.getPair(MONAD_TOKEN_ADDRESS, WETH_ADDRESS);
  
  console.log("\nPair check:");
  console.log("Actual Pair Address:", actualPairAddress);
  console.log("Matches expected:", actualPairAddress.toLowerCase() === PAIR_ADDRESS!.toLowerCase());

  // Check if the pair exists and has liquidity
  if (actualPairAddress !== ethers.constants.AddressZero) {
    const pair = new ethers.Contract(actualPairAddress, pairABI, provider);
    
    // Get tokens in the pair
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    
    console.log("\nPair tokens:");
    console.log("Token0:", token0);
    console.log("Token1:", token1);
    
    // Get reserves
    const reserves = await pair.getReserves();
    
    console.log("\nReserves:");
    console.log("Reserve0:", ethers.utils.formatEther(reserves.reserve0));
    console.log("Reserve1:", ethers.utils.formatEther(reserves.reserve1));
    
    if (reserves.reserve0.eq(0) || reserves.reserve1.eq(0)) {
      console.log("\n⚠️ WARNING: One or both reserves are zero. No liquidity in the pair!");
      console.log("You need to add liquidity to this pair before swapping.");
    } else {
      console.log("\n✅ Pair has liquidity and should work for swapping.");
    }
  } else {
    console.log("\n❌ Pair does not exist! You need to create the pair first.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 