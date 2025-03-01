import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying UserXP contract with the account:", deployer.address);

  // Deploy UserXP
  const UserXP = await ethers.getContractFactory("UserXP");
  const userXP = await UserXP.deploy();
  await userXP.deployed();
  console.log("UserXP deployed to:", userXP.address);

  // Set router address (UniswapV2Router)
  const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
  if (ROUTER_ADDRESS) {
    await userXP.setRouter(ROUTER_ADDRESS);
    console.log("Router address set to:", ROUTER_ADDRESS);
  }

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("UserXP Address:", userXP.address);
  console.log("Router Address:", ROUTER_ADDRESS || "Not set");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 