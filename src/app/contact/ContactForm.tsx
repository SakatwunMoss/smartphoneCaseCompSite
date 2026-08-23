"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("準備中です。今後対応予定です。");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            お名前
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            お問い合わせ内容
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40"
            placeholder="お問い合わせ内容をご記入ください"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-200"
        >
          送信する
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
        >
          {message}
        </p>
      ) : null}
    </>
  );
}
