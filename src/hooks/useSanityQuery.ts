import { useQuery, type UseQueryResult, type UseQueryOptions } from "@tanstack/react-query";
import { client as sanityClient } from "@/lib/sanity/client";

/**
 * Opsi untuk hook useSanityQuery.
 * @template T - Tipe data yang diharapkan dari hasil query.
 */
interface UseSanityQueryProps<T> {
  /** Query GROQ yang akan dieksekusi. */
  query: string;
  /** Parameter untuk query GROQ (opsional). */
  params?: Record<string, any>;
  /** Opsi tambahan untuk TanStack Query. */
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>;
}

/**
 * Custom hook untuk mengambil data dari Sanity.io menggunakan TanStack Query.
 * Hook ini bersifat type-safe dan terintegrasi dengan tipe dari Sanity TypeGen.
 *
 * @template T - Tipe data yang diharapkan dari hasil query.
 * @param {UseSanityQueryProps<T>} props - Properti untuk hook.
 * @returns {UseQueryResult<T, Error>} Hasil dari useQuery.
 */
export function useSanityQuery<T>({
  query,
  params = {},
  options = {},
}: UseSanityQueryProps<T>): UseQueryResult<T, Error> {
  const queryKey = ['sanity', query, params];

  return useQuery<T, Error, T>({
    queryKey,
    queryFn: () => sanityClient.fetch<T>(query, params),
    ...options,
  });
}