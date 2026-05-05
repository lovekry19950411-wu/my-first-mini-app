import { Engine, createThirdwebClient } from "thirdweb";
import fs from "fs";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});
const myServerWallet = Engine.serverWallet({
  client,
  address: process.env.NEXT_PUBLIC_SERVER_WALLET,
  vaultAccessToken: process.env.ENGINE_VAULT_TOKEN,
});
const abi = JSON.parse(fs.readFileSync("./NXZBondingCurve.abi.json", "utf8"));
if (!Array.isArray(abi) || abi.length === 0) {
  throw new Error(
    "NXZBondingCurve.abi.json is empty. Replace it with the compiled contract ABI (see scripts/deploy-nxz-thirdweb.ts).",
  );
}
const bytecode = fs.readFileSync("./NXZBondingCurve.bin").toString();
const deployParams: any[] = []; // 如建構式有參數也填在這

(async () => {
  try {
    const tx = await myServerWallet.enqueueTransaction({
      transaction: {
        type: "deployContract",
        bytecode,
        abi,
        args: deployParams,
        chainId: 480, // World Chain
      },
    });
    console.log("部署已送出，transactionId:", tx.transactionId);
  } catch (e) {
    console.error("部署失敗：", e);
  }
})();
