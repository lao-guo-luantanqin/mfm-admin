import { reactive } from "vue";
import type { CollectionFilterDef } from "@/config/business-modules";

export type CollectionFilterValues = Record<
  string,
  string | number | boolean | undefined
>;

function defaultValue(
  def: CollectionFilterDef
): CollectionFilterValues[string] {
  if (def.type === "boolean") return undefined;
  return undefined;
}

export function useCollectionFilters(defs: CollectionFilterDef[] = []) {
  const initial: CollectionFilterValues = {};
  for (const def of defs) {
    initial[def.prop] = defaultValue(def);
  }

  const values = reactive<CollectionFilterValues>({ ...initial });

  function resetFilters() {
    for (const def of defs) {
      delete values[def.prop];
    }
  }

  function filterParams(): CollectionFilterValues {
    const out: CollectionFilterValues = {};
    for (const def of defs) {
      const val = values[def.prop];
      if (val === undefined || val === null || val === "") continue;
      out[def.prop] = val;
    }
    return out;
  }

  function hasActiveFilters(): boolean {
    return Object.keys(filterParams()).length > 0;
  }

  return {
    values,
    resetFilters,
    filterParams,
    hasActiveFilters
  };
}
