import type { MetadataRoute } from "next";

import { getAllCatalogPhones } from "@/lib/catalog";
import { columns } from "@/lib/columns";

const BASE_URL = "https://smartphone-case-comp-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const phones = getAllCatalogPhones();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/columns`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/tokushoho`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const phonePages: MetadataRoute.Sitemap = phones.map((phone) => ({
    url: `${BASE_URL}/phones/${phone.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const columnPages: MetadataRoute.Sitemap = columns.map((column) => ({
    url: `${BASE_URL}/columns/${column.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...phonePages, ...columnPages];
}
