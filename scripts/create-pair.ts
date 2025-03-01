import { ethers } from "hardhat";

// Gerekli kontrat adreslerini .env dosyasından alacağız
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const MONAD_TOKEN_ADDRESS = process.env.MONAD_TOKEN_ADDRESS || "";
const WETH_ADDRESS = process.env.WETH_ADDRESS || "";

async function main() {
  if (!FACTORY_ADDRESS || !MONAD_TOKEN_ADDRESS || !WETH_ADDRESS) {
    throw new Error("FACTORY_ADDRESS, MONAD_TOKEN_ADDRESS and WETH_ADDRESS must be set in .env file");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Creating pair with the account:", deployer.address);

  // Get Factory contract instance
  const factory = await ethers.getContractAt("UniswapV2Factory", FACTORY_ADDRESS);

  // Create MONAD-WETH pair
  await factory.createPair(MONAD_TOKEN_ADDRESS, WETH_ADDRESS);
  const pairAddress = await factory.getPair(MONAD_TOKEN_ADDRESS, WETH_ADDRESS);
  console.log("MONAD-WETH Pair created at:", pairAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 