"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function ProductsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status")?.toUpperCase() ?? "ALL";
  const currentSearch = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(currentSearch);

  useEffect(() => {
    setInputValue(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed === currentSearch) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value.toLowerCase());
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    setInputValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-64">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products…"
          className="w-full h-9 pl-8 pr-8 rounded-lg text-[13px] outline-none transition-colors duration-150 bg-card border border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors duration-100 text-muted-foreground hover:text-text-secondary"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const active = currentStatus === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                "h-7 px-3 rounded-full text-[12px] font-medium transition-colors duration-150 whitespace-nowrap border",
                active
                  ? "bg-primary border-primary text-primary-foreground"
                  : "text-muted-foreground border-border hover:bg-card hover:text-text-secondary",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
