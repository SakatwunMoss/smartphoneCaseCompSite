export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Phone Case Compare
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          スマホケース比較サイト
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          ここにスマホケースの比較一覧を表示する予定です。
        </p>
      </main>
    </div>
  );
}
