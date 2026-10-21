export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 rounded-2xl bg-white p-10 shadow-sm dark:bg-zinc-950">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          VaasaETT
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Web app monorepo
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Next.js frontend in <code className="font-mono text-sm">frontend/</code>{" "}
          and ASP.NET API in <code className="font-mono text-sm">backend/</code>.
        </p>
      </main>
    </div>
  );
}
