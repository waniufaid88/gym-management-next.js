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

  useEffect(() => {
    setSearch(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      params.delete("page");

      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, debounce);

    return () => clearTimeout(timer);
  }, [search, debounce, pathname, router, searchParams]);

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
