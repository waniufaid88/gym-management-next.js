"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

type SearchValues = { search: string };

type Props = {
  initialValue?: string;
  placeholder: string;
};

export function SearchForm({ initialValue = "", placeholder }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, reset } = useForm<SearchValues>({
    defaultValues: { search: initialValue },
  });

  useEffect(() => {
    reset({ search: initialValue });
  }, [initialValue, reset]);

  function submitSearch(values: SearchValues) {
    const params = new URLSearchParams(searchParams.toString());
    const search = values.search.trim();

    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit(submitSearch)}>
      <InputGroup className="w-70">
        <InputGroupInput
          type="search"
          placeholder={placeholder}
          {...register("search")}
        />
        <InputGroupAddon align="inline-end">
          <Button type="submit" variant="secondary" className="cursor-pointer">
            <Search />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
