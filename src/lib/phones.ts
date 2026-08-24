import { supabase } from "@/lib/supabase";
import type { PhoneFilters } from "@/lib/phone-filters";
import type { Phone } from "@/types/database";

export async function getPhoneFilterOptions(): Promise<{
  makers: string[];
  years: number[];
}> {
  const { data, error } = await supabase
    .from("phones")
    .select("maker, released_year");

  if (error || !data) {
    console.error("Failed to fetch phone filter options:", error);
    return { makers: [], years: [] };
  }

  const rows = data as Pick<Phone, "maker" | "released_year">[];
  const makers = [...new Set(rows.map((phone) => phone.maker))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  const years = [...new Set(rows.map((phone) => phone.released_year))].sort(
    (a, b) => b - a,
  );

  return { makers, years };
}

export async function getPhones(filters: PhoneFilters): Promise<{
  phones: Phone[] | null;
  error: string | null;
}> {
  let query = supabase.from("phones").select("*");

  if (filters.makers.length > 0) {
    query = query.in("maker", filters.makers);
  }

  if (filters.year) {
    query = query.eq("released_year", Number(filters.year));
  }

  switch (filters.sort) {
    case "year_asc":
      query = query.order("released_year", { ascending: true });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("released_year", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch phones:", error);
    return { phones: null, error: error.message };
  }

  return { phones: data ?? [], error: null };
}
