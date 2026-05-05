import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const pk =
  process.env.HARDHAT_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;
const accounts =
  pk != null && pk !== ""
    ? [pk.startsWith("0x") ? pk : `0x${pk}`]
    : [];

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    "world-chain": {
      url:
        process.env.WORLDCHAIN_RPC_URL ??
        "https://worldchain-mainnet.g.alchemy.com/public",
      accounts,
    },
  },
};

export default config;
