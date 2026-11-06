"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

type Props = {
  initialValue?: string;
  placeholder: string;
  debounce?: number;
};

export function SearchForm({
  initialValue = "",
  placeholder,
  debounce = 500,
}: Props) {
  const [search, setSearch] = useState(initialValue);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearchParams = searchParams.toString();

  useEffect(() => {
    setSearch(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(currentSearchParams);
      const nextSearch = search.trim();
      const currentSearch = params.get("search")?.trim() ?? "";

      if (nextSearch === currentSearch) return;

      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      params.delete("page");

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, debounce);

    return () => clearTimeout(timer);
  }, [search, debounce, pathname, router, currentSearchParams]);

  return (
    <InputGroup className="w-70">
      <InputGroupInput
        type="search"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </InputGroup>
  );
}
