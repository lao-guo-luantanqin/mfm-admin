/** 业务模块配置 · 对齐旧版 uni-admin db.vue 与 MFM 集合白名单 */

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
    id: "property-project-image",
    title: "楼盘图片库",
    description: "效果图、户型图等多分类相册与首图标记",
    path: "/business/property-project-image/index",
    collection: "mfm_property_project_image",
    icon: "ep:picture-filled",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
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
    id: "collections",
    title: "集合文档（高级）",
    description: "白名单 Mongo 集合 JSON 直编",
    path: "/business/collections/index",
    collection: "",
    icon: "ep:document",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  }
];

export type CollectionColumnDef = {
  prop: string;
  label: string;
  minWidth?: number;
  width?: number;
  type?: "text" | "image" | "tag" | "boolean";
  tagMap?: Record<
    string,
    {
      label: string;
      type?: "primary" | "success" | "warning" | "info" | "danger";
    }
  >;
};

export const collectionPageConfigs: Record<
  string,
  { title: string; searchPlaceholder: string; columns: CollectionColumnDef[] }
> = {
  mfm_property_project: {
    title: "房产项目",
    searchPlaceholder: "搜索项目名称…",
    columns: [
      { prop: "project_name", label: "项目名称", minWidth: 160 },
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
      { prop: "avg_unit_price", label: "均价(元/㎡)", width: 120 },
      { prop: "developer_name", label: "开发商", minWidth: 140 },
      { prop: "cover_image", label: "封面", width: 88, type: "image" }
    ]
  },
  mfm_property_project_image: {
    title: "楼盘图片库",
    searchPlaceholder: "搜索标题或描述…",
    columns: [
      { prop: "image_url", label: "素材", width: 88, type: "image" },
      { prop: "title", label: "标题", minWidth: 160 },
      { prop: "category", label: "分类", width: 100 },
      { prop: "project_id", label: "楼盘 ID", minWidth: 200 },
      { prop: "sort_order", label: "排序", width: 72 },
      { prop: "is_cover", label: "首图", width: 72, type: "boolean" },
      { prop: "is_active", label: "展示", width: 72, type: "boolean" }
    ]
  },
  mfm_banner: {
    title: "Banner 广告位",
    searchPlaceholder: "搜索标题…",
    columns: [
      { prop: "title", label: "标题", minWidth: 160 },
      { prop: "sort", label: "排序", width: 72 },
      { prop: "status", label: "上线", width: 72, type: "boolean" },
      { prop: "open_url", label: "跳转路径", minWidth: 200 },
      { prop: "bannerfile", label: "素材", width: 88, type: "image" }
    ]
  }
};
