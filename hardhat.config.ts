import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [PRIVATE_KEY],
      gasPrice: 100000000000, // 100 gwei
      gas: 3000000, // 3M gas limit
      timeout: 60000 // 60 seconds
    },
  },
};

export default config; 