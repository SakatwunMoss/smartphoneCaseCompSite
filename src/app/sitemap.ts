import type { MetadataRoute } from "next";

import { columns } from "@/lib/columns";
import { supabase } from "@/lib/supabase";
import type { Phone } from "@/types/database";

const BASE_URL = "https://smartphone-case-comp-site.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data, error } = await supabase.from("phones").select("*");

  if (error) {
    console.error("Failed to fetch phones for sitemap:", error);
  }

  const phones: Phone[] = data ?? [];
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
