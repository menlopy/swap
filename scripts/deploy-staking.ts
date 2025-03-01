import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Staking contracts with the account:", deployer.address);

  // Deploy StakingToken
  const StakingToken = await ethers.getContractFactory("StakingToken");
  const stakingToken = await StakingToken.deploy();
  await stakingToken.deployed();
  console.log("StakingToken deployed to:", stakingToken.address);

  // Deploy LPStaking with parameters
  // LP Token adresi olarak MONAD-WETH pair adresini kullanacağız
  const LP_TOKEN_ADDRESS = process.env.PAIR_ADDRESS || "";
  if (!LP_TOKEN_ADDRESS) {
    throw new Error("PAIR_ADDRESS must be set in .env file");
  }

  // Başlangıç ödül oranı (yıllık %5 APR'ye denk gelir)
  const INITIAL_REWARD_RATE = ethers.utils.parseEther("0.00000001585489599"); // ~5% APR
  
  // Hedef stake miktarı (1 milyon LP token)
  const TARGET_STAKE_AMOUNT = ethers.utils.parseEther("1000000");
  
  const LPStaking = await ethers.getContractFactory("LPStaking");
  const lpStaking = await LPStaking.deploy(
    LP_TOKEN_ADDRESS,
    stakingToken.address,
    INITIAL_REWARD_RATE,
    TARGET_STAKE_AMOUNT
  );
  await lpStaking.deployed();
  console.log("LPStaking deployed to:", lpStaking.address);

  // StakingToken kontratının ownership'ini LPStaking'e devret
  await stakingToken.transferOwnership(lpStaking.address);
  console.log("StakingToken ownership transferred to LPStaking contract");

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Initial APR: 5-20%");
  console.log("Minimum Stake Period: 30 days");
  console.log("Maximum Stake Period: 365 days");
  console.log("Maximum Multiplier: 2x");
  console.log("Target Stake Amount:", ethers.utils.formatEther(TARGET_STAKE_AMOUNT), "LP");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 