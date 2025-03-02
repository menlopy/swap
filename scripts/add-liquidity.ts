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
    console.log(`Using wallet address: ${wallet.address}`);

    // Contract addresses
    const ROUTER_ADDRESS = "0x8eceC8132ebB3BeA5dCfB9fd2d33fF9a0DC9242D";
    const MONAD_TOKEN_ADDRESS = "0x62D1040C7584feFB31a554B5970bbF34A838eDa2";
    const WETH_ADDRESS = "0xf14d8131e66c33C6bA481c7941D682A37a2da98F";

    console.log("Router address:", ROUTER_ADDRESS);
    console.log("MONAD token address:", MONAD_TOKEN_ADDRESS);
    console.log("WETH address:", WETH_ADDRESS);

    // Router ABI for addLiquidity function
    const routerAbi = [
      "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ];

    // ERC20 ABI for approve function
    const erc20Abi = [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)"
    ];

    console.log("Creating contract instances...");
    
    // Create contract instances
    const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);
    const monadToken = new ethers.Contract(MONAD_TOKEN_ADDRESS, erc20Abi, wallet);
    const wethToken = new ethers.Contract(WETH_ADDRESS, erc20Abi, wallet);

    console.log("Checking token balances...");
    
    // Check token balances
    const monadBalance = await monadToken.balanceOf(wallet.address);
    console.log("MONAD balance fetched:", monadBalance.toString());
    
    const wethBalance = await wethToken.balanceOf(wallet.address);
    console.log("WETH balance fetched:", wethBalance.toString());
    
    const monadDecimals = await monadToken.decimals();
    console.log("MONAD decimals:", monadDecimals);
    
    const wethDecimals = await wethToken.decimals();
    console.log("WETH decimals:", wethDecimals);
    
    const monadSymbol = await monadToken.symbol();
    console.log("MONAD symbol:", monadSymbol);
    
    const wethSymbol = await wethToken.symbol();
    console.log("WETH symbol:", wethSymbol);

    console.log(`Balance: ${ethers.utils.formatUnits(monadBalance, monadDecimals)} ${monadSymbol}`);
    console.log(`Balance: ${ethers.utils.formatUnits(wethBalance, wethDecimals)} ${wethSymbol}`);

    // Define amounts for liquidity
    const monadAmount = ethers.utils.parseUnits("1000", monadDecimals); // 1000 MONAD
    const wethAmount = ethers.utils.parseUnits("10", wethDecimals);     // 10 WETH

    console.log("MONAD amount to add:", ethers.utils.formatUnits(monadAmount, monadDecimals));
    console.log("WETH amount to add:", ethers.utils.formatUnits(wethAmount, wethDecimals));

    // Check if we have enough balance
    if (monadBalance.lt(monadAmount)) {
      throw new Error(`Not enough ${monadSymbol} balance. Need ${ethers.utils.formatUnits(monadAmount, monadDecimals)}, have ${ethers.utils.formatUnits(monadBalance, monadDecimals)}`);
    }

    if (wethBalance.lt(wethAmount)) {
      throw new Error(`Not enough ${wethSymbol} balance. Need ${ethers.utils.formatUnits(wethAmount, wethDecimals)}, have ${ethers.utils.formatUnits(wethBalance, wethDecimals)}`);
    }

    console.log(`Adding liquidity: ${ethers.utils.formatUnits(monadAmount, monadDecimals)} ${monadSymbol} and ${ethers.utils.formatUnits(wethAmount, wethDecimals)} ${wethSymbol}`);

    // Approve router to spend tokens
    console.log("Approving MONAD token...");
    const monadApproveTx = await monadToken.approve(ROUTER_ADDRESS, monadAmount);
    console.log("MONAD approve transaction sent:", monadApproveTx.hash);
    
    const monadApproveReceipt = await monadApproveTx.wait();
    console.log(`MONAD approved in block ${monadApproveReceipt.blockNumber}: ${monadApproveTx.hash}`);

    console.log("Approving WETH token...");
    const wethApproveTx = await wethToken.approve(ROUTER_ADDRESS, wethAmount);
    console.log("WETH approve transaction sent:", wethApproveTx.hash);
    
    const wethApproveReceipt = await wethApproveTx.wait();
    console.log(`WETH approved in block ${wethApproveReceipt.blockNumber}: ${wethApproveTx.hash}`);

    // Add liquidity
    console.log("Adding liquidity...");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
    console.log("Deadline:", new Date(deadline * 1000).toLocaleString());
    
    console.log("Calling addLiquidity with parameters:");
    console.log("- MONAD token:", MONAD_TOKEN_ADDRESS);
    console.log("- WETH token:", WETH_ADDRESS);
    console.log("- MONAD amount:", monadAmount.toString());
    console.log("- WETH amount:", wethAmount.toString());
    console.log("- MONAD min:", "0");
    console.log("- WETH min:", "0");
    console.log("- To:", wallet.address);
    console.log("- Deadline:", deadline);
    
    const addLiquidityTx = await router.addLiquidity(
      MONAD_TOKEN_ADDRESS,
      WETH_ADDRESS,
      monadAmount,
      wethAmount,
      0, // amountAMin (accept any amount)
      0, // amountBMin (accept any amount)
      wallet.address,
      deadline,
      { gasLimit: 3000000 } // Set a high gas limit for safety
    );

    console.log(`Transaction sent: ${addLiquidityTx.hash}`);
    const receipt = await addLiquidityTx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log("Liquidity added successfully!");
  } catch (error) {
    console.error("Error in main function:");
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in main promise:");
    console.error(error);
    process.exit(1);
  }); 