import TipBox from "@/components/TipBox";
export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <AuthButton />
        <TipBox />
      </Page.Main>
    </Page>
  );
}
