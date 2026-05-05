/**
 * Thirdweb SDK deploy script — run only with secrets in the environment, never in source.
 * Usage (PowerShell): `$env:THIRDWEB_SECRET_KEY="..."; $env:DEPLOYER_PRIVATE_KEY="..."; npx tsx scripts/deploy-nxz-thirdweb.ts`
 */
import { deployContract } from "thirdweb/deploys";
import { worldChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import fs from "fs";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const pk = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.HARDHAT_PRIVATE_KEY;
if (!pk) {
  throw new Error("Set DEPLOYER_PRIVATE_KEY or HARDHAT_PRIVATE_KEY in the environment.");
}
const privateKey = (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`;

const account = privateKeyToAccount({
  client,
  privateKey,
});

export async function deployNXZ() {
  const abiPath = "./NXZBondingCurve.abi.json";
  const bytecodePath = "./NXZBondingCurve.bin";

  const abiRaw = fs.readFileSync(abiPath, "utf8");
  const abi = JSON.parse(abiRaw);
  if (!Array.isArray(abi) || abi.length === 0) {
    throw new Error(
      `Replace ${abiPath} with the compiled contract ABI (JSON array) before deploying.`,
    );
  }
  const bytecode = fs.readFileSync(bytecodePath).toString();

  console.log("🚀 正在通過 Thirdweb SDK 部署 NXZ...");

  const contractAddress = await deployContract({
    client,
    chain: worldChain,
    account,
    bytecode: bytecode.startsWith("0x") ? bytecode : `0x${bytecode}`,
    abi,
    params: [
      process.env.NXZ_TOKEN_NAME ?? "Neuxs Globl",
      process.env.NXZ_TOKEN_SYMBOL ?? "NXZ",
      process.env.NXZ_USDC_ADDRESS ?? "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
      process.env.NXZ_TREASURY_ADDRESS ?? "0x8bfe4647304e9564c48f4457e5082275f200042f",
      process.env.NXZ_WORLD_ID_ADDRESS ?? "0x17B354dD2595411ff79041f930e491A4Df39A278",
    ],
  });

  console.log("✨ 部署成功！合約地址:", contractAddress);
  return contractAddress;
}

deployNXZ().catch((e: Error) => {
  console.error("❌ 部署失敗原因:", e.message);
  process.exit(1);
});
