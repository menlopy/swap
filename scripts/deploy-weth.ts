import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying WETH Token with the account:", deployer.address);

  // Deploy WETH Token
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH Token deployed to:", weth.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 