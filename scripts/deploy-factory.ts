import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying UniswapV2Factory with the account:", deployer.address);

  // Deploy UniswapV2Factory
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("UniswapV2Factory deployed to:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 