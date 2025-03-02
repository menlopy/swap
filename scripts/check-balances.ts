import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    // Get private key from .env
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Private key not found in .env file");
    }

    // Connect to Monad testnet
    const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Wallet address: ${wallet.address}`);

    // Token addresses
    const MONAD_ADDRESS = "0x62D1040C7584feFB31a554B5970bbF34A838eDa2";
    const WETH_ADDRESS = "0xf14d8131e66c33C6bA481c7941D682A37a2da98F";

    console.log("MONAD address:", MONAD_ADDRESS);
    console.log("WETH address:", WETH_ADDRESS);

    // ERC20 ABI
    const erc20Abi = [
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
      "function name() external view returns (string)"
    ];

    // Create contract instances
    console.log("Creating contract instances...");
    const monadToken = new ethers.Contract(MONAD_ADDRESS, erc20Abi, provider);
    const wethToken = new ethers.Contract(WETH_ADDRESS, erc20Abi, provider);

    // Get token details
    console.log("Checking MONAD details...");
    try {
      const monadName = await monadToken.name();
      console.log("MONAD name:", monadName);
      
      const monadSymbol = await monadToken.symbol();
      console.log("MONAD symbol:", monadSymbol);
      
      const monadDecimals = await monadToken.decimals();
      console.log("MONAD decimals:", monadDecimals);
      
      console.log("Checking MONAD balance...");
      const monadBalance = await monadToken.balanceOf(wallet.address);
      console.log("MONAD balance (raw):", monadBalance.toString());
      console.log(`MONAD balance: ${ethers.utils.formatUnits(monadBalance, monadDecimals)} ${monadSymbol}`);
    } catch (error) {
      console.error("Error getting MONAD details:", error);
    }

    console.log("Checking WETH details...");
    try {
      const wethName = await wethToken.name();
      console.log("WETH name:", wethName);
      
      const wethSymbol = await wethToken.symbol();
      console.log("WETH symbol:", wethSymbol);
      
      const wethDecimals = await wethToken.decimals();
      console.log("WETH decimals:", wethDecimals);
      
      console.log("Checking WETH balance...");
      const wethBalance = await wethToken.balanceOf(wallet.address);
      console.log("WETH balance (raw):", wethBalance.toString());
      console.log(`WETH balance: ${ethers.utils.formatUnits(wethBalance, wethDecimals)} ${wethSymbol}`);
    } catch (error) {
      console.error("Error getting WETH details:", error);
    }

    // Get ETH balance
    console.log("Checking ETH balance...");
    const ethBalance = await provider.getBalance(wallet.address);
    console.log("ETH balance (raw):", ethBalance.toString());
    console.log(`ETH balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 