import { DiagnoseCta } from "@/components/DiagnoseCta";

export function DiagnosePromoBanner() {
  return (
    <section
      aria-labelledby="diagnose-banner-heading"
      className="w-full bg-white px-6 py-5 sm:py-6"
    >
      <div className="mx-auto flex min-h-[9.5rem] w-full max-w-6xl flex-col items-stretch justify-between gap-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-6 text-white shadow-md sm:min-h-[7.5rem] sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-7">
        <div className="min-w-0 flex-1">
          <h2
            id="diagnose-banner-heading"
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            あなたにぴったりのケースは？
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/95 sm:text-base">
            いくつかの質問に答えるだけで、好みに合うケースタイプがわかります
          </p>
        </div>
        <DiagnoseCta variant="banner" className="w-full sm:w-auto" />
      </div>
    </section>
  );
}
