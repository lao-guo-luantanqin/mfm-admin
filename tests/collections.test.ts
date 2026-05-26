import { beforeEach, describe, expect, it, vi } from "vitest";

const { request } = vi.hoisted(() => ({
  request: vi.fn()
}));

vi.mock("@/utils/http", () => ({
  http: { request }
}));

import {
  deleteRecord,
  fetchCollectionMeta,
  fetchRecord,
  fetchRecordsPage,
  saveRecord
} from "@/api/admin/collections";

describe("admin collections API", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it("fetchCollectionMeta → GET /admin/collections", async () => {
    await fetchCollectionMeta();
    expect(request).toHaveBeenCalledWith("get", "/admin/collections");
  });

  it("fetchRecordsPage 对 collection 做 encodeURIComponent", async () => {
    await fetchRecordsPage("a/b", { currentPage: 1, pageSize: 10 });
    expect(request).toHaveBeenCalledWith(
      "get",
      "/admin/collections/a%2Fb/records",
      expect.objectContaining({ params: { currentPage: 1, pageSize: 10 } })
    );
  });

  it("fetchRecord / deleteRecord 编码 collection 与 docId", async () => {
    await fetchRecord("mfm_banner", "id/with");
    expect(request).toHaveBeenLastCalledWith(
      "get",
      "/admin/collections/mfm_banner/records/id%2Fwith"
    );

    await deleteRecord("x", "demo-1");
    expect(request).toHaveBeenLastCalledWith(
      "delete",
      "/admin/collections/x/records/demo-1"
    );
  });

  it("saveRecord：有 docId 走 PUT，无 docId 走 POST", async () => {
    const doc = { project_name: "示例" };
    await saveRecord("mfm_property_project", doc, "abc");
    expect(request).toHaveBeenLastCalledWith(
      "put",
      "/admin/collections/mfm_property_project/records/abc",
      { data: { document: doc } }
    );

    await saveRecord("mfm_property_project", doc);
    expect(request).toHaveBeenLastCalledWith(
      "post",
      "/admin/collections/mfm_property_project/records",
      { data: { document: doc } }
    );
  });
});
