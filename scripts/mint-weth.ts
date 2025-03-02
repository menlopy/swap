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

    // WETH contract address
    const WETH_ADDRESS = "0xf14d8131e66c33C6bA481c7941D682A37a2da98F";

    // WETH ABI for deposit function (to mint WETH by sending ETH)
    const wethAbi = [
      "function deposit() external payable",
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)"
    ];

    // Create WETH contract instance
    const wethContract = new ethers.Contract(WETH_ADDRESS, wethAbi, wallet);

    // Check initial WETH balance
    const initialBalance = await wethContract.balanceOf(wallet.address);
    const decimals = await wethContract.decimals();
    const symbol = await wethContract.symbol();
    console.log(`Initial ${symbol} balance: ${ethers.utils.formatUnits(initialBalance, decimals)}`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log(`ETH balance: ${ethers.utils.formatEther(ethBalance)}`);

    // Amount of ETH to convert to WETH (20 ETH)
    const ethAmount = ethers.utils.parseEther("20");

    if (ethBalance.lt(ethAmount)) {
      throw new Error(`Not enough ETH balance. Need ${ethers.utils.formatEther(ethAmount)}, have ${ethers.utils.formatEther(ethBalance)}`);
    }

    console.log(`Converting ${ethers.utils.formatEther(ethAmount)} ETH to WETH...`);

    // Deposit ETH to get WETH
    const tx = await wethContract.deposit({
      value: ethAmount,
      gasLimit: 100000
    });

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Check final WETH balance
    const finalBalance = await wethContract.balanceOf(wallet.address);
    console.log(`Final ${symbol} balance: ${ethers.utils.formatUnits(finalBalance, decimals)}`);
    console.log(`Minted ${ethers.utils.formatUnits(finalBalance.sub(initialBalance), decimals)} ${symbol}`);

    console.log("WETH minting completed successfully!");
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