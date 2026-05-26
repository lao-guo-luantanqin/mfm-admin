import { reactive } from "vue";

export type CollectionSortState = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

export type CollectionSortDefaults = CollectionSortState;

export function useCollectionSort(defaults?: CollectionSortDefaults) {
  const defaultSortBy = defaults?.sortBy ?? "";
  const defaultSortOrder = defaults?.sortOrder ?? "desc";

  const sortState = reactive<CollectionSortState>({
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder
  });

  function onSortChange(payload: {
    prop: string;
    order: "ascending" | "descending" | null;
  }) {
    if (payload.order) {
      sortState.sortBy = payload.prop;
      sortState.sortOrder = payload.order === "ascending" ? "asc" : "desc";
      return;
    }
    sortState.sortBy = defaultSortBy;
    sortState.sortOrder = defaultSortOrder;
  }

  function sortParams(): {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } {
    if (!sortState.sortBy) {
      return {};
    }
    return {
      sortBy: sortState.sortBy,
      sortOrder: sortState.sortOrder
    };
  }

  return {
    sortState,
    onSortChange,
    sortParams
  };
}
