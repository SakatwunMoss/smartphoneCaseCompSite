import type { MetadataRoute } from "next";

import { getAllCatalogPhones, getCatalogGeneratedAt } from "@/lib/catalog";
import { columns } from "@/lib/columns";

const BASE_URL = "https://smartphone-case-comp-site.vercel.app";

/** 静的ページ用の固定 lastModified（コンテンツ大きく変えたら更新する） */
const STATIC_LAST_MODIFIED = new Date("2026-03-01T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const phones = getAllCatalogPhones();
  const catalogGeneratedAt = new Date(getCatalogGeneratedAt());

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/diagnose`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/columns`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/tokushoho`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const phonePages: MetadataRoute.Sitemap = phones.map((phone) => ({
    url: `${BASE_URL}/phones/${phone.id}`,
    lastModified: catalogGeneratedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const columnPages: MetadataRoute.Sitemap = columns.map((column) => ({
    url: `${BASE_URL}/columns/${column.slug}`,
    lastModified: new Date(column.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...phonePages, ...columnPages];
}
