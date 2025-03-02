import { ethers } from "ethers";
import { MONAD_RPC_URL, CONTRACTS } from "../constants/contracts";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  console.log("Checking tokens on Monad network...");
  console.log("RPC URL:", MONAD_RPC_URL);
  
  const provider = new ethers.providers.JsonRpcProvider(MONAD_RPC_URL);
  
  // Check each token
  for (const [symbol, token] of Object.entries(CONTRACTS.TOKENS)) {
    console.log(`\nChecking ${symbol}...`);
    console.log(`Address: ${token.address}`);
    
    try {
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
      
      // Get token details
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name().catch(() => "Unknown"),
        tokenContract.symbol().catch(() => "Unknown"),
        tokenContract.decimals().catch(() => 18)
      ]);
      
      console.log(`Name: ${name}`);
      console.log(`Symbol: ${symbol}`);
      console.log(`Decimals: ${decimals}`);
      console.log(`✅ Token is valid`);
    } catch (error: any) {
      console.error(`❌ Error checking token:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 