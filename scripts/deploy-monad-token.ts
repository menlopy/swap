import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MONAD Token with the account:", deployer.address);

  // Deploy MONAD Token
  const MonadToken = await ethers.getContractFactory("MonadToken");
  const monadToken = await MonadToken.deploy();
  await monadToken.deployed();
  console.log("MONAD Token deployed to:", monadToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 