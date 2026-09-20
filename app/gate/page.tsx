import SiteGateForm from "@/components/SiteGateForm";

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <SiteGateForm from={params.from} />
    </main>
  );
}
