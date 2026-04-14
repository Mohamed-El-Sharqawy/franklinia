"use client";

import { useState, useEffect } from "react";
import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import { useRouter } from "@/i18n/navigation";
import {
  DEFAULT_SORT,
  DEFAULT_MIN_PRICE,
  DEFAULT_MAX_PRICE,
  PRICE_DEBOUNCE_MS,
} from "../constants";
import type { Fabric, FitType, SleeveStyle } from "@ecommerce/shared-types";

export function useCollectionFilters() {
  const router = useRouter();

  // URL-synced state with nuqs
  const [sortOption, setSortOption] = useQueryState("sort", parseAsString.withDefault(DEFAULT_SORT));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger.withDefault(DEFAULT_MIN_PRICE));
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger.withDefault(DEFAULT_MAX_PRICE));

  // Debounced price values for fetching
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);

  // Local state (not URL-synced)
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availability, setAvailability] = useQueryState(
    "availability",
    parseAsStringLiteral(["all", "inStock", "outOfStock"] as const).withDefault("all")
  );

  // Fashion filters (URL-synced)
  const [fabric, setFabric] = useQueryState("fabric", parseAsString.withDefault(""));
  const [occasion, setOccasion] = useQueryState("occasion", parseAsString.withDefault(""));
  const [fitType, setFitType] = useQueryState("fitType", parseAsString.withDefault(""));
  const [sleeveStyle, setSleeveStyle] = useQueryState("sleeveStyle", parseAsString.withDefault(""));

  // Debounce price changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, PRICE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const navigateToCollection = (collectionSlug: string | null) => {
    setIsFilterOpen(false);
    if (collectionSlug) {
      router.push(`/collections/${collectionSlug}`);
    } else {
      router.push("/collections/all-products");
    }
  };

  return {
    sortOption,
    setSortOption,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    debouncedMinPrice,
    debouncedMaxPrice,
    isSortOpen,
    setIsSortOpen,
    isFilterOpen,
    setIsFilterOpen,
    availability,
    setAvailability,
    // Fashion filters
    fabric: fabric || null,
    setFabric: (v: string | null) => setFabric(v ?? ""),
    occasion: occasion || null,
    setOccasion: (v: string | null) => setOccasion(v ?? ""),
    fitType: fitType || null,
    setFitType: (v: string | null) => setFitType(v ?? ""),
    sleeveStyle: sleeveStyle || null,
    setSleeveStyle: (v: string | null) => setSleeveStyle(v ?? ""),
    navigateToCollection,
    clearFilters: () => {
      setMinPrice(DEFAULT_MIN_PRICE);
      setMaxPrice(DEFAULT_MAX_PRICE);
      setAvailability("all");
      setFabric("");
      setOccasion("");
      setFitType("");
      setSleeveStyle("");
    },
  };
}
