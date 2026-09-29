import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiagnoseQuiz } from "@/components/diagnose/DiagnoseQuiz";
import { getAllCatalogPhones } from "@/lib/catalog";
import { diagnoseCopy } from "@/lib/diagnose/copy";
import { buildDiagnoseCases } from "@/lib/diagnose/purchaseUrl";
import { buildPageMetadata } from "@/lib/metadata";

const { meta } = diagnoseCopy;

export const metadata: Metadata = buildPageMetadata({
  title: `${meta.title.en} / ${meta.title.ja} | Phone Case Compare`,
  description: `${meta.description.ja} ${meta.description.en}`,
  path: "/diagnose",
});

export default function DiagnosePage() {
  const catalogPhones = getAllCatalogPhones();
  const phones = catalogPhones.map((phone) => ({
    id: phone.id,
    name: phone.name,
    maker: phone.maker,
  }));
  // 購入導線は楽天/Yahoo を優先（marketplace_offers を主カタログにする）
  const cases = buildDiagnoseCases(catalogPhones);

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "ホーム", href: "/" },
            {
              label: `${meta.breadcrumb.en} / ${meta.breadcrumb.ja}`,
              href: "/diagnose",
            },
          ]}
        />
        <DiagnoseQuiz phones={phones} cases={cases} />
      </main>
    </div>
  );
}
