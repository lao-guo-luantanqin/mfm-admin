/** 业务模块配置 · 列表列、筛选与排序 */

import {
  bannerCategoryOptions,
  projectImageCategoryOptions,
  saleStatusOptions,
  tagCategoryOptions,
  tagTypeOptions
} from "@/config/collection-forms";

export type BusinessModuleCard = {
  id: string;
  title: string;
  description: string;
  path: string;
  collection: string;
  icon: string;
  gradient: string;
};

export const businessModuleCards: BusinessModuleCard[] = [
  {
    id: "property-project",
    title: "房产项目管理",
    description: "楼盘基准数据、销售状态与封面展示字段",
    path: "/business/property-project/index",
    collection: "mfm_property_project",
    icon: "ep:office-building",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: "banner",
    title: "Banner 广告位",
    description: "轮播素材、跳转路径与排序权重",
    path: "/business/banner/index",
    collection: "mfm_banner",
    icon: "ep:picture",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)"
  },
  {
    id: "property-tag",
    title: "标签词典",
    description: "楼盘展示标签定义、分类与配色",
    path: "/business/property-tag/index",
    collection: "mfm_property_tag",
    icon: "ep:price-tag",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
  },
  {
    id: "collections",
    title: "集合文档（高级）",
    description: "白名单 Mongo 集合 JSON 直编",
    path: "/business/collections/index",
    collection: "",
    icon: "ep:document",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  }
];

/** sort_order 全站统一：数值越大，列表展示越靠前（默认降序） */
export const SORT_ORDER_HINT = "越大越靠前";

export type CollectionColumnDef = {
  prop: string;
  label: string;
  minWidth?: number;
  width?: number;
  type?: "text" | "image" | "tag" | "boolean";
  sortable?: boolean;
  tagMap?: Record<
    string,
    {
      label: string;
      type?: "primary" | "success" | "warning" | "info" | "danger";
    }
  >;
};

export type CollectionFilterDef =
  | {
      prop: string;
      label: string;
      type: "select";
      options: Array<{ label: string; value: string | number | boolean }>;
    }
  | { prop: string; label: string; type: "text" }
  | { prop: string; label: string; type: "boolean" }
  | { prop: string; label: string; type: "project" };

export type CollectionPageConfig = {
  title: string;
  searchPlaceholder: string;
  defaultSort: { sortBy: string; sortOrder: "asc" | "desc" };
  columns: CollectionColumnDef[];
  filters: CollectionFilterDef[];
};

export const tagCategoryTagMap: Record<
  string,
  {
    label: string;
    type?: "primary" | "success" | "warning" | "info" | "danger";
  }
> = {
  developer: { label: "开发商标签", type: "info" },
  house_status: { label: "销售状态", type: "success" },
  building_metrics: { label: "建筑指标", type: "warning" },
  transportation: { label: "交通配套", type: "primary" },
  education: { label: "教育配套", type: "primary" },
  commercial: { label: "商业配套", type: "danger" },
  ecological: { label: "生态配套", type: "success" },
  living_experience: { label: "居住体验", type: "warning" },
  space_utilization: { label: "空间利用", type: "info" },
  investment_attributes: { label: "投资属性", type: "info" }
};

export function tagCategoryLabel(category: string): string {
  return tagCategoryTagMap[category]?.label ?? category;
}

/** 楼盘上下文内管理图片时的筛选项（不含楼盘） */
export const projectImageManageFilters: CollectionFilterDef[] = [
  {
    prop: "category",
    label: "分类",
    type: "select",
    options: projectImageCategoryOptions
  },
  { prop: "is_cover", label: "首图", type: "boolean" },
  { prop: "is_active", label: "展示", type: "boolean" }
];

export const collectionPageConfigs: Record<string, CollectionPageConfig> = {
  mfm_property_project: {
    title: "房产项目",
    searchPlaceholder: "搜索项目名称…",
    defaultSort: { sortBy: "sort_order", sortOrder: "desc" },
    filters: [
      {
        prop: "sale_status",
        label: "销售状态",
        type: "select",
        options: saleStatusOptions
      },
      { prop: "district_name", label: "区域", type: "text" },
      { prop: "is_active", label: "上架", type: "boolean" },
      { prop: "is_hot", label: "热门", type: "boolean" },
      { prop: "is_new_house", label: "新房", type: "boolean" }
    ],
    columns: [
      {
        prop: "project_name",
        label: "项目名称",
        minWidth: 160,
        sortable: true
      },
      { prop: "sort_order", label: "排序", width: 72, sortable: true },
      { prop: "district_name", label: "区域", width: 100 },
      {
        prop: "sale_status",
        label: "销售状态",
        width: 100,
        type: "tag",
        tagMap: {
          onsale: { label: "在售", type: "success" },
          presale: { label: "预售", type: "warning" },
          soldout: { label: "售罄", type: "info" }
        }
      },
      {
        prop: "avg_unit_price",
        label: "均价(元/㎡)",
        width: 120,
        sortable: true
      },
      {
        prop: "developer_name",
        label: "开发商名称",
        minWidth: 160,
        type: "text"
      },
      { prop: "cover_image", label: "封面", width: 88, type: "image" },
      { prop: "tag_count", label: "标签数", width: 96, sortable: true }
    ]
  },
  mfm_property_project_image: {
    title: "楼盘图片库",
    searchPlaceholder: "搜索标题或描述…",
    defaultSort: { sortBy: "sort_order", sortOrder: "desc" },
    filters: [
      { prop: "project_id", label: "楼盘", type: "project" },
      {
        prop: "category",
        label: "分类",
        type: "select",
        options: projectImageCategoryOptions
      },
      { prop: "is_cover", label: "首图", type: "boolean" },
      { prop: "is_active", label: "展示", type: "boolean" }
    ],
    columns: [
      { prop: "image_url", label: "素材", width: 88, type: "image" },
      { prop: "title", label: "标题", minWidth: 160, sortable: true },
      { prop: "category", label: "分类", width: 100, sortable: true },
      { prop: "project_id", label: "楼盘 ID", minWidth: 200 },
      { prop: "sort_order", label: "排序", width: 72, sortable: true },
      { prop: "is_cover", label: "首图", width: 72, type: "boolean" },
      { prop: "is_active", label: "展示", width: 72, type: "boolean" }
    ]
  },
  mfm_banner: {
    title: "Banner 广告位",
    searchPlaceholder: "搜索标题…",
    defaultSort: { sortBy: "sort_order", sortOrder: "desc" },
    filters: [
      {
        prop: "category_id",
        label: "展示位置",
        type: "select",
        options: bannerCategoryOptions
      },
      { prop: "status", label: "上线", type: "boolean" }
    ],
    columns: [
      { prop: "title", label: "标题", minWidth: 160, sortable: true },
      { prop: "sort_order", label: "排序", width: 72, sortable: true },
      { prop: "status", label: "上线", width: 72, type: "boolean" },
      { prop: "open_url", label: "跳转路径", minWidth: 200 },
      { prop: "bannerfile", label: "素材", width: 88, type: "image" }
    ]
  },
  mfm_property_tag: {
    title: "标签词典",
    searchPlaceholder: "搜索标签名称…",
    defaultSort: { sortBy: "sort_order", sortOrder: "desc" },
    filters: [
      {
        prop: "category",
        label: "分类",
        type: "select",
        options: tagCategoryOptions
      },
      { prop: "type", label: "场景", type: "select", options: tagTypeOptions },
      {
        prop: "status",
        label: "启用",
        type: "select",
        options: [
          { label: "启用", value: 1 },
          { label: "禁用", value: 0 }
        ]
      }
    ],
    columns: [
      { prop: "name", label: "标签名称", minWidth: 140, sortable: true },
      {
        prop: "category",
        label: "分类",
        width: 120,
        type: "tag",
        tagMap: tagCategoryTagMap
      },
      {
        prop: "type",
        label: "场景",
        width: 88,
        type: "tag",
        tagMap: {
          new_house: { label: "新房", type: "primary" },
          second_hand: { label: "二手房", type: "warning" },
          all: { label: "全场景", type: "info" }
        }
      },
      { prop: "sort_order", label: "排序", width: 72, sortable: true },
      { prop: "status", label: "启用", width: 72, type: "boolean" },
      { prop: "color", label: "文字色", width: 96 }
    ]
  }
};
