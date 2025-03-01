import { ethers } from "hardhat";

// Factory ve WETH adreslerini .env dosyasından alacağız
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const WETH_ADDRESS = process.env.WETH_ADDRESS || "";

async function main() {
  if (!FACTORY_ADDRESS || !WETH_ADDRESS) {
    throw new Error("FACTORY_ADDRESS and WETH_ADDRESS must be set in .env file");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying UniswapV2Router with the account:", deployer.address);

  // Deploy UniswapV2Router
  const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router");
  const router = await UniswapV2Router.deploy(FACTORY_ADDRESS, WETH_ADDRESS);
  await router.deployed();
  console.log("UniswapV2Router deployed to:", router.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 