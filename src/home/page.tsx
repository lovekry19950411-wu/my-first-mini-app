import TipBox from "../components/TipBox";

export default function HomePage() {
  return (
    <div>
      <h1>歡迎！</h1>
      <TipBox /> {/* ← 這一行是關鍵！ */}
    </div>
  );
}
