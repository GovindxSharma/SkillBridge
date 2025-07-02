// hooks/useAuthUser.ts
"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  });

export default function useAuthUser() {
  const { data, error, mutate } = useSWR("/api/user/me", fetcher);

  return {
    user: data?.user || null,
    loading: !data && !error,
    mutate,
  };
}
