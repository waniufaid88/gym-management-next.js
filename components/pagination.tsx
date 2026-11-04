"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  PaginationContent,
  Pagination,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage?: number;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage = 5,
}: PaginationProps) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = new URLSearchParams(searchParams.toString());

  const handlePrevious = () => {
    if (currentPage === 1 || currentPage - 1 === 1) {
      params.delete("page");
    } else {
      params.set("page", (currentPage - 1).toString());
    }

    router.push(`${pathName}?${params.toString()}`);
  };

  const handleNext = () => {
    params.set("page", (currentPage + 1).toString());

    router.push(`${pathName}?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: string | null) => {
    params.set("page", "1");
    params.set("limit", newLimit ?? "5");

    router.push(`${pathName}?${params.toString()}`);
  };

  return (
    <div className="flex w-full items-center justify-between p-2">
      <div className="font-bold text-slate-950/50">
        {`${rowsPerPage} of ${totalRows}`}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-row">
          <Field orientation="horizontal" className="w-fit items-center">
            <p className="w-fit items-center whitespace-nowrap">
              Rows per page
            </p>

            <Select
              value={searchParams.get("limit") ?? "5"}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-20" id="select-rows-per-page">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="link"
                onClick={handlePrevious}
                disabled={currentPage <= 1}
              >
                <ChevronLeftIcon data-icon="inline-start" />
                <span className="hidden sm:block">Prev</span>
              </Button>
            </PaginationItem>

            <span className="text-sm text-primary">
              <strong>{currentPage}</strong> of {totalPages}
            </span>

            <PaginationItem>
              <Button
                variant="link"
                onClick={handleNext}
                disabled={currentPage >= totalPages}
              >
                <span className="hidden sm:block">Next</span>
                <ChevronRightIcon data-icon="inline-start" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
