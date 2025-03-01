import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MONAD Token
  const MonadToken = await ethers.getContractFactory("MonadToken");
  const monadToken = await MonadToken.deploy();
  await monadToken.deployed();
  console.log("MONAD Token deployed to:", monadToken.address);

  // Deploy WETH Token
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH Token deployed to:", weth.address);

  // Deploy UniswapV2Factory
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("UniswapV2Factory deployed to:", factory.address);

  // Deploy UniswapV2Router
  const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router");
  const router = await UniswapV2Router.deploy(factory.address, weth.address);
  await router.deployed();
  console.log("UniswapV2Router deployed to:", router.address);

  // Create MONAD-WETH pair
  await factory.createPair(monadToken.address, weth.address);
  const pairAddress = await factory.getPair(monadToken.address, weth.address);
  console.log("MONAD-WETH Pair created at:", pairAddress);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("MONAD Token:", monadToken.address);
  console.log("WETH Token:", weth.address);
  console.log("UniswapV2Factory:", factory.address);
  console.log("UniswapV2Router:", router.address);
  console.log("MONAD-WETH Pair:", pairAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 