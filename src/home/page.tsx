import { AuthButton } from "@/components/AuthButton";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <h1 className="text-2xl font-bold">每日籤詩</h1>
      <p className="text-gray-600">登入後即可抽籤</p>
      <AuthButton />
    </main>
  );
}
