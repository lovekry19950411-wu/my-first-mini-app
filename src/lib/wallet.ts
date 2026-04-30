import { createWalletClient, custom, parseUnits, waitForTransactionReceipt } from 'viem';
import { worldChainSepolia, worldChain } from 'viem/chains';
import { MiniKit } from '@worldcoin/minikit-js';

//  GRANT OPTIMIZATION: 明確鏈配置與代幣精度聲明，符合 Web3 審計標準
// World Chain Mainnet: 480 | Sepolia Testnet: 4801
const CHAIN = worldChainSepolia; // 生產環境切換為 worldChain

const USDC_CONTRACTS: Record<number, `0x${string}`> = {
  [worldChainSepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  [worldChain.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',   // Mainnet USDC
};

// 標準 ERC-20 Transfer ABI (最小化氣費)
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function payForFortune(
  receiverAddress: string,
  amountUSDC: string // 字串格式，例: "0.30"
) {
  if (!MiniKit.isInstalled()) throw new Error('環境錯誤：僅支援 World App 內嵌');
  if (!MiniKit.walletAddress) throw new Error('錢包未連線，請先完成 World ID 驗證');

  const account = MiniKit.walletAddress as `0x${string}`;
  const usdcAddress = USDC_CONTRACTS[CHAIN.id];
  if (!usdcAddress) throw new Error('不支援的區塊鏈配置');

  // USDC 為 6 位小數
  const amountWei = parseUnits(amountUSDC, 6);

  // 🔧 建立錢包客戶端（透過 MiniKit 注入的 Provider）
  const walletClient = createWalletClient({
    chain: CHAIN,
    transport: custom(MiniKit.walletProvider || window.ethereum),
  });

  // 📊 預先估算 Gas，防止交易因 Gas 不足失敗（補助 UX 加分項）
  const gasEstimate = await walletClient.estimateContractGas({
    account,
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [receiverAddress as `0x${string}`, amountWei],
  });

  // ⛓️ 執行鏈上轉帳
  const txHash = await walletClient.writeContract({
    account,
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [receiverAddress as `0x${string}`, amountWei],
    gas: gasEstimate + BigInt(60_000), //  安全緩衝，適配 L2 動態 Gas 波動
  });

  //  等待鏈上確認，返回完整收據
  const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
  
  return {
    txHash,
    status: receipt.status,
    blockNumber: receipt.blockNumber,
    chainId: CHAIN.id,
  };
}
