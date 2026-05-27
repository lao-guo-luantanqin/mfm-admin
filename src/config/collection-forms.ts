/** 集合编辑表单配置 · 对齐旧版 uni-admin 业务页字段 */

import { normalizeMediaPublicUrl } from "@/utils/media/qiniu-upload";

export type FormFieldOption = {
  label: string;
  value: string | number | boolean;
};

export type ImageStorageKind =
  | "banner"
  | "project-cover"
  | "project-image"
  | "static-asset";

export type CollectionFormField = {
  prop: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multi-select"
    | "switch"
    | "image"
    | "image-object"
    | "project-search"
    | "project-name-suggest"
    | "tag-search"
    | "doc-id"
    | "date"
    | "string-list"
    | "number-list"
    | "geo-point";
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  /** 只读展示，不可编辑 */
  disabled?: boolean;
  /** project-search：选中后写入的 Mongo 字段（如 project_id） */
  bindProp?: string;
  /** image / image-object 专用 */
  storage?: ImageStorageKind;
  hint?: string;
  span?: number;
  /** project-image：上传前须先填写的表单字段名 */
  uploadDeps?: { projectId?: string; category?: string };
};

export type CollectionFormSection = {
  title: string;
  fields: CollectionFormField[];
};

export type CollectionFormConfig = {
  sections: CollectionFormSection[];
  /** 新建时的默认值 */
  defaults?: Record<string, unknown>;
};

export const saleStatusOptions: FormFieldOption[] = [
  { label: "在售", value: "onsale" },
  { label: "预售", value: "presale" },
  { label: "售罄", value: "soldout" }
];

const propertyTypeOptions: FormFieldOption[] = [
  { label: "住宅", value: "住宅" },
  { label: "公寓", value: "公寓" },
  { label: "商铺", value: "商铺" },
  { label: "写字楼", value: "写字楼" },
  { label: "车位", value: "车位" }
];

const buildingTypeOptions: FormFieldOption[] = [
  { label: "别墅", value: "别墅" },
  { label: "洋房", value: "洋房" },
  { label: "高层", value: "高层" },
  { label: "超高层", value: "超高层" },
  { label: "小高层", value: "小高层" }
];

const buildingStructureOptions: FormFieldOption[] = [
  { label: "板楼", value: "板楼" },
  { label: "塔楼", value: "塔楼" },
  { label: "板塔结合", value: "板塔结合" }
];

const decorationStatusOptions: FormFieldOption[] = [
  { label: "毛坯", value: "毛坯" },
  { label: "精装修", value: "精装修" },
  { label: "全装", value: "全装" }
];

/** ``mfm_banner.category_id``（与库表、page_config.props.categoryId 一致） */
export const bannerCategoryOptions: FormFieldOption[] = [
  { label: "新房首页·顶部轮播", value: "home_carousel_top" },
  { label: "新房首页·腰封小轮播", value: "home_carousel_small" },
  { label: "二手房首页·顶部轮播", value: "ershou_carousel_top" },
  { label: "楼盘列表·热门楼盘顶栏", value: "project_list_popular" },
  { label: "楼盘列表·销许/登记顶栏", value: "project_list_license" },
  { label: "资讯·顶部轮播", value: "news_carousel_top" },
  { label: "营销·活动推广", value: "marketing_activity" }
];

export const projectImageCategoryOptions: FormFieldOption[] = [
  { label: "效果图", value: "效果图" },
  { label: "实景图", value: "实景图" },
  { label: "样板间", value: "样板间" },
  { label: "配套图", value: "配套图" },
  { label: "区位图", value: "区位图" },
  { label: "户型图", value: "户型图" },
  { label: "总平图", value: "总平图" },
  { label: "板块图", value: "板块图" },
  { label: "规划许可证", value: "规划许可证" },
  { label: "预售许可证", value: "预售许可证" }
];

export const tagCategoryOptions: FormFieldOption[] = [
  { label: "开发商", value: "developer" },
  { label: "销售状态", value: "house_status" },
  { label: "建筑指标", value: "building_metrics" },
  { label: "交通配套", value: "transportation" },
  { label: "教育配套", value: "education" },
  { label: "商业配套", value: "commercial" },
  { label: "生态配套", value: "ecological" },
  { label: "居住体验", value: "living_experience" },
  { label: "空间利用", value: "space_utilization" },
  { label: "投资属性", value: "investment_attributes" }
];

export const tagTypeOptions: FormFieldOption[] = [
  { label: "新房", value: "new_house" },
  { label: "二手房", value: "second_hand" },
  { label: "全场景", value: "all" }
];

const TAG_CATEGORY_COLORS: Record<string, string> = {
  developer: "#11213D",
  house_status: "#00C853",
  building_metrics: "#D4A276",
  transportation: "#2576F3",
  education: "#722ED1",
  commercial: "#EB2F96",
  ecological: "#13C2C2",
  living_experience: "#FA541C",
  space_utilization: "#2F54EB",
  investment_attributes: "#828caa"
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(153, 153, 153, ${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function tagColorsForCategory(category: string): {
  color: string;
  bgColor: string;
} {
  const color = TAG_CATEGORY_COLORS[category] ?? "#999999";
  return {
    color,
    bgColor: hexToRgba(color, 0.12)
  };
}

export const collectionFormConfigs: Record<string, CollectionFormConfig> = {
  mfm_property_project: {
    defaults: {
      sale_status: "onsale",
      is_active: true,
      is_new_house: true,
      price_unit: "元/㎡",
      building_area_unit: "m²",
      decoration_standard: "暂无数据",
      location: { lng: 117.0, lat: 36.65 }
    },
    sections: [
      {
        title: "核心信息",
        fields: [
          {
            prop: "_id",
            label: "文档 _id",
            type: "doc-id",
            disabled: true,
            placeholder: "新建保存后自动生成"
          },
          {
            prop: "project_name",
            label: "项目名称",
            type: "project-name-suggest",
            required: true,
            placeholder: "输入项目名称，可参考已有楼盘"
          },
          {
            prop: "project_title",
            label: "项目副标题",
            type: "text",
            placeholder: "如：城央大平层，一梯一户"
          },
          {
            prop: "cover_image",
            label: "封面图片",
            type: "image",
            required: true,
            storage: "project-cover",
            hint: "上传前自动压缩，直传七牛后写入 cover_image"
          },
          {
            prop: "property_type",
            label: "物业类型",
            type: "select",
            options: propertyTypeOptions,
            span: 12
          },
          {
            prop: "building_type",
            label: "建筑类型",
            type: "multi-select",
            options: buildingTypeOptions,
            hint: "可多选，如洋房、小高层",
            span: 12
          },
          {
            prop: "building_structure",
            label: "建筑结构",
            type: "select",
            options: buildingStructureOptions,
            span: 12
          },
          {
            prop: "developer_name",
            label: "开发商",
            type: "text",
            span: 12
          },
          {
            prop: "developer_brand",
            label: "开发品牌",
            type: "text",
            span: 12
          },
          {
            prop: "plot_names",
            label: "地块名称",
            type: "string-list",
            placeholder: "多个地块用逗号分隔",
            span: 12
          },
          {
            prop: "plot_id",
            label: "关联地块 ID",
            type: "string-list",
            placeholder: "UUID，逗号分隔",
            span: 12
          },
          {
            prop: "sort_order",
            label: "排序号",
            type: "number",
            placeholder: "越大越靠前",
            span: 12
          },
          {
            prop: "on_shelf_date",
            label: "上架日期",
            type: "text",
            placeholder: "如 2025-01-15",
            span: 12
          }
        ]
      },
      {
        title: "位置信息",
        fields: [
          {
            prop: "district_name",
            label: "行政区",
            type: "text",
            placeholder: "例如：历下区",
            span: 12
          },
          {
            prop: "plate_name",
            label: "板块",
            type: "text",
            placeholder: "例如：CBD",
            span: 12
          },
          {
            prop: "address",
            label: "详细地址",
            type: "textarea",
            placeholder: "街道或交叉路口详址"
          },
          {
            prop: "location",
            label: "地理位置 (GeoPoint)",
            type: "geo-point",
            required: true,
            hint: "地图点击选点、搜索 POI，或直接改经纬度；保存为 Mongo GeoJSON"
          }
        ]
      },
      {
        title: "销售与展示标签",
        fields: [
          {
            prop: "sale_status",
            label: "销售状态",
            type: "select",
            options: saleStatusOptions,
            span: 12
          },
          {
            prop: "presale_time",
            label: "预售年月",
            type: "date",
            span: 12
          },
          {
            prop: "is_new_house",
            label: "是否新房",
            type: "switch",
            span: 8
          },
          {
            prop: "is_active",
            label: "是否启用",
            type: "switch",
            span: 8
          },
          {
            prop: "is_hot",
            label: "是否热门",
            type: "switch",
            span: 8
          },
          {
            prop: "is_recommend",
            label: "是否推荐",
            type: "switch",
            span: 8
          },
          {
            prop: "is_new_disk",
            label: "是否新盘",
            type: "switch",
            span: 8
          },
          {
            prop: "is_bargain",
            label: "是否特价",
            type: "switch",
            span: 8
          },
          {
            prop: "has_discount",
            label: "是否有优惠",
            type: "switch",
            span: 8
          },
          {
            prop: "has_aerial_photography",
            label: "是否有航拍",
            type: "switch",
            span: 8
          },
          {
            prop: "has_vr",
            label: "是否有 VR",
            type: "switch",
            span: 8
          },
          {
            prop: "has_evaluation",
            label: "是否有测评",
            type: "switch",
            span: 8
          },
          {
            prop: "has_building_spacing",
            label: "是否有楼间距",
            type: "switch",
            span: 8
          },
          {
            prop: "has_sunshine",
            label: "是否有光照",
            type: "switch",
            span: 8
          },
          {
            prop: "has_layout_distribution",
            label: "是否有户型分布",
            type: "switch",
            span: 8
          }
        ]
      },
      {
        title: "价格",
        fields: [
          {
            prop: "price_display",
            label: "显示价格",
            type: "text",
            placeholder: "如 约15000元/㎡"
          },
          {
            prop: "avg_unit_price",
            label: "均价 (元/㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "min_unit_price",
            label: "最低单价 (元/㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "max_unit_price",
            label: "最高单价 (元/㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "min_total_price",
            label: "最低总价 (元)",
            type: "number",
            span: 12
          },
          {
            prop: "max_total_price",
            label: "最高总价 (元)",
            type: "number",
            span: 12
          },
          {
            prop: "reference_total_price",
            label: "参考总价 (元)",
            type: "number",
            span: 12
          },
          {
            prop: "reference_unit_price",
            label: "参考单价 (元/㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "latest_reference_unit_price",
            label: "最新参考均价 (元/㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "latest_reference_total_price",
            label: "最新参考总价 (元)",
            type: "number",
            span: 12
          },
          {
            prop: "down_payment_ratio",
            label: "首付比例 (%)",
            type: "number",
            placeholder: "15 表示 1.5 成，20 表示 2 成",
            span: 12
          },
          {
            prop: "price_unit",
            label: "价格单位",
            type: "text",
            placeholder: "元/㎡",
            span: 12
          }
        ]
      },
      {
        title: "面积与套数",
        fields: [
          {
            prop: "building_area_min",
            label: "最小建筑面积 (㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "building_area_max",
            label: "最大建筑面积 (㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "building_area_range",
            label: "面积区间",
            type: "text",
            placeholder: "如 90-120㎡",
            span: 12
          },
          {
            prop: "building_area_unit",
            label: "建筑面积单位",
            type: "text",
            placeholder: "m²",
            span: 12
          },
          {
            prop: "building_area",
            label: "总建筑面积 (㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "land_area",
            label: "占地面积 (㎡)",
            type: "number",
            span: 12
          },
          {
            prop: "total_sets",
            label: "总套数",
            type: "number",
            span: 12
          },
          {
            prop: "remaining_sets",
            label: "剩余套数",
            type: "number",
            span: 12
          },
          {
            prop: "sold_rate",
            label: "去化率",
            type: "number",
            placeholder: "0.755 表示 75.5%",
            span: 12
          },
          {
            prop: "total_building_count",
            label: "总楼栋数",
            type: "number",
            span: 12
          },
          {
            prop: "property_right_age",
            label: "产权年限 (年)",
            type: "number",
            span: 12
          }
        ]
      },
      {
        title: "规划与产品",
        fields: [
          {
            prop: "plot_ratio",
            label: "容积率",
            type: "number",
            placeholder: "如 2.5",
            span: 12
          },
          {
            prop: "green_rate",
            label: "绿化率",
            type: "number",
            placeholder: "如 0.35",
            span: 12
          },
          {
            prop: "floor_status",
            label: "楼层状况",
            type: "string-list",
            placeholder: "如 7F, 18F",
            span: 12
          },
          {
            prop: "floor_height",
            label: "建筑层高 (m)",
            type: "number-list",
            placeholder: "如 2.9, 3.05",
            span: 12
          },
          {
            prop: "elevator_ratio",
            label: "梯户比",
            type: "string-list",
            placeholder: "如 1T2, 2T2",
            span: 12
          },
          {
            prop: "decoration_standard",
            label: "装修标准",
            type: "text",
            placeholder: "如 xxx元/㎡"
          },
          {
            prop: "decoration_status",
            label: "装修情况",
            type: "multi-select",
            options: decorationStatusOptions,
            span: 12
          }
        ]
      },
      {
        title: "车位与物业",
        fields: [
          {
            prop: "parking_count",
            label: "车位数",
            type: "number",
            span: 12
          },
          {
            prop: "parking_price",
            label: "车位价格 (元)",
            type: "number",
            span: 12
          },
          {
            prop: "parking_rate",
            label: "车位比",
            type: "number",
            placeholder: "如 1.2",
            span: 12
          },
          {
            prop: "property_fee",
            label: "物业费",
            type: "text",
            placeholder: "如 2.36元/m²/月",
            span: 12
          },
          {
            prop: "property_company",
            label: "物业公司",
            type: "text",
            span: 12
          },
          {
            prop: "sales_rank",
            label: "销量榜排名",
            type: "text",
            placeholder: "如 历城区网签销量榜第2名"
          }
        ]
      },
      {
        title: "时间节点",
        fields: [
          {
            prop: "latest_opening_date",
            label: "最新开盘日期",
            type: "text",
            placeholder: "如 2025-11-29",
            span: 12
          },
          {
            prop: "delivery_time",
            label: "交房时间",
            type: "text",
            placeholder: "如 2027-6，精确到月",
            span: 12
          },
          {
            prop: "land_acquisition_time",
            label: "拿地时间",
            type: "date",
            span: 12
          },
          {
            prop: "land_acquisition_price",
            label: "拿地价格",
            type: "text",
            placeholder: "元/㎡ 整数，或 6400-7000 区间文案",
            span: 12
          }
        ]
      },
      {
        title: "统计（只读）",
        fields: [
          {
            prop: "attention_count",
            label: "关注人数",
            type: "number",
            disabled: true,
            span: 12
          },
          {
            prop: "follow_count",
            label: "跟进人数",
            type: "number",
            disabled: true,
            span: 12
          },
          {
            prop: "view_count",
            label: "浏览次数",
            type: "number",
            disabled: true,
            span: 12
          },
          {
            prop: "comment_count",
            label: "评论次数",
            type: "number",
            disabled: true,
            span: 12
          },
          {
            prop: "create_time",
            label: "创建时间",
            type: "text",
            disabled: true,
            span: 12
          },
          {
            prop: "update_time",
            label: "更新时间",
            type: "text",
            disabled: true,
            span: 12
          }
        ]
      }
    ]
  },
  mfm_banner: {
    defaults: {
      status: true,
      sort_order: 100,
      category_id: "home_carousel_top"
    },
    sections: [
      {
        title: "素材文件",
        fields: [
          {
            prop: "bannerfile",
            label: "广告图素材",
            type: "image-object",
            required: true,
            storage: "banner",
            hint: "建议尺寸 750×300 或 16:9；上传前自动压缩"
          }
        ]
      },
      {
        title: "内容与链接",
        fields: [
          {
            prop: "title",
            label: "轮播标题",
            type: "text",
            placeholder: "例如：济南新盘优惠大放送"
          },
          {
            prop: "open_url",
            label: "跳转路径",
            type: "textarea",
            placeholder: "http/https 链接或小程序内部页面路径"
          }
        ]
      },
      {
        title: "发布与权重",
        fields: [
          {
            prop: "category_id",
            label: "展示位置",
            type: "select",
            options: bannerCategoryOptions,
            span: 12
          },
          {
            prop: "sort_order",
            label: "排序号",
            type: "number",
            placeholder: "越大越靠前",
            span: 12
          },
          {
            prop: "status",
            label: "发布状态",
            type: "switch"
          },
          {
            prop: "description",
            label: "内部备注",
            type: "textarea",
            placeholder: "仅限管理员可见"
          }
        ]
      }
    ]
  },
  mfm_property_project_image: {
    defaults: {
      sort_order: 100,
      is_cover: false,
      is_active: true
    },
    sections: [
      {
        title: "关联楼盘",
        fields: [
          {
            prop: "project_id",
            label: "项目名称",
            type: "project-search",
            required: true,
            bindProp: "project_id",
            placeholder: "输入项目名称，从下拉列表选择"
          },
          {
            prop: "project_id",
            label: "关联楼盘 ID",
            type: "text",
            disabled: true,
            placeholder: "选择项目名称后自动填入"
          }
        ]
      },
      {
        title: "媒体属性",
        fields: [
          {
            prop: "category",
            label: "图片分类",
            type: "select",
            required: true,
            options: projectImageCategoryOptions,
            span: 12
          },
          {
            prop: "sort_order",
            label: "排序号",
            type: "number",
            placeholder: "越大越靠前",
            span: 12
          },
          {
            prop: "image_url",
            label: "图片上传",
            type: "image",
            required: true,
            storage: "project-image",
            uploadDeps: { projectId: "project_id", category: "category" },
            hint: "须先选分类并选择楼盘；上传前自动压缩"
          }
        ]
      },
      {
        title: "文案与展示",
        fields: [
          {
            prop: "title",
            label: "图片标题",
            type: "text",
            placeholder: "例如：客厅实景"
          },
          {
            prop: "description",
            label: "图片描述",
            type: "textarea",
            placeholder: "可选说明"
          },
          {
            prop: "is_cover",
            label: "设为首图",
            type: "switch",
            span: 12
          },
          {
            prop: "is_active",
            label: "审核展示",
            type: "switch",
            span: 12
          }
        ]
      }
    ]
  },
  mfm_property_tag: {
    defaults: {
      subtitle: "",
      type: "all",
      iconUrl: "",
      hasHelpIcon: false,
      helpText: "",
      sort_order: 0,
      likeCount: 0,
      status: 1
    },
    sections: [
      {
        title: "基础信息",
        fields: [
          {
            prop: "name",
            label: "标签名称",
            type: "text",
            required: true,
            placeholder: "例如：近地铁、准现房"
          },
          {
            prop: "subtitle",
            label: "副标题",
            type: "text",
            placeholder: "可选辅助文案"
          },
          {
            prop: "category",
            label: "标签分类",
            type: "select",
            required: true,
            options: tagCategoryOptions,
            span: 12
          },
          {
            prop: "type",
            label: "适用场景",
            type: "select",
            required: true,
            options: tagTypeOptions,
            span: 12
          }
        ]
      },
      {
        title: "视觉样式",
        fields: [
          {
            prop: "color",
            label: "文字颜色",
            type: "text",
            placeholder: "#722ED1",
            span: 12
          },
          {
            prop: "bgColor",
            label: "背景颜色",
            type: "text",
            placeholder: "rgba(114, 46, 209, 0.12)",
            span: 12
          },
          {
            prop: "iconUrl",
            label: "图标 URL",
            type: "text",
            placeholder: "可选"
          }
        ]
      },
      {
        title: "说明与排序",
        fields: [
          {
            prop: "hasHelpIcon",
            label: "显示说明图标",
            type: "switch",
            span: 12
          },
          {
            prop: "status",
            label: "启用状态",
            type: "select",
            options: [
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 }
            ],
            span: 12
          },
          {
            prop: "helpText",
            label: "名词释义",
            type: "textarea",
            placeholder: "Tooltip 中展示的详细解释"
          },
          {
            prop: "sort_order",
            label: "排序号",
            type: "number",
            placeholder: "越大越靠前",
            span: 12
          },
          {
            prop: "likeCount",
            label: "获赞数",
            type: "number",
            span: 12
          }
        ]
      }
    ]
  },
  mfm_property_project_tag: {
    defaults: {
      sort_order: 50
    },
    sections: [
      {
        title: "关联对象",
        fields: [
          {
            prop: "project_id",
            label: "楼盘项目",
            type: "project-search",
            required: true,
            bindProp: "project_id",
            placeholder: "输入项目名称搜索"
          },
          {
            prop: "project_name",
            label: "楼盘名称",
            type: "text",
            disabled: true,
            placeholder: "选择项目后自动填入"
          },
          {
            prop: "tag_id",
            label: "标签",
            type: "tag-search",
            required: true,
            bindProp: "tag_id",
            placeholder: "输入标签名称搜索"
          },
          {
            prop: "tag_name",
            label: "标签名称",
            type: "text",
            disabled: true,
            placeholder: "选择标签后自动填入"
          },
          {
            prop: "category",
            label: "标签分类",
            type: "text",
            disabled: true,
            placeholder: "选择标签后自动填入"
          }
        ]
      },
      {
        title: "展示排序",
        fields: [
          {
            prop: "sort_order",
            label: "排序号",
            type: "number",
            placeholder: "越大越靠前",
            hint: "同一楼盘下多个标签的展示顺序"
          }
        ]
      }
    ]
  }
};

export function getCollectionFormConfig(
  collection: string
): CollectionFormConfig | undefined {
  return collectionFormConfigs[collection];
}

function unwrapMongoDate(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "$date" in raw) {
    return String((raw as { $date: string }).$date);
  }
  return String(raw);
}

function parseStringList(raw: unknown): string {
  if (Array.isArray(raw)) return raw.map(String).join(", ");
  return raw == null ? "" : String(raw);
}

function parseNumberList(raw: unknown): string {
  if (Array.isArray(raw)) return raw.map(String).join(", ");
  return raw == null ? "" : String(raw);
}

function parseGeoPoint(raw: unknown): { lng?: number; lat?: number } {
  if (!raw || typeof raw !== "object") return {};
  const coords = (raw as { coordinates?: unknown }).coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return {};
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  return {
    lng: Number.isFinite(lng) ? lng : undefined,
    lat: Number.isFinite(lat) ? lat : undefined
  };
}

function serializeStringList(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  const text = String(val ?? "").trim();
  if (!text) return [];
  return text
    .split(/[,，\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function serializeNumberList(val: unknown): number[] {
  return serializeStringList(val)
    .map(Number)
    .filter(n => Number.isFinite(n));
}

function serializeGeoPoint(
  val: unknown
): { type: "Point"; coordinates: [number, number] } | null {
  if (!val || typeof val !== "object") return null;
  const { lng, lat } = val as { lng?: number; lat?: number };
  if (
    lng == null ||
    lat == null ||
    !Number.isFinite(lng) ||
    !Number.isFinite(lat)
  ) {
    return null;
  }
  return { type: "Point", coordinates: [Number(lng), Number(lat)] };
}

function serializeLandAcquisitionPrice(val: unknown): number | string | null {
  if (val === "" || val === null || val === undefined) return null;
  const text = String(val).trim();
  if (/^\d+$/.test(text)) return Number(text);
  return text;
}

/** 从行数据提取表单可编辑字段（含图片字段规范化） */
export function rowToFormData(
  row: Record<string, unknown>,
  config: CollectionFormConfig
): Record<string, unknown> {
  const data: Record<string, unknown> = { ...config.defaults };
  const fields = config.sections.flatMap(s => s.fields);

  for (const field of fields) {
    const raw = field.prop in row ? row[field.prop] : data[field.prop];
    if (raw !== undefined) {
      data[field.prop] = normalizeFieldFromRow(raw, field.prop, config);
    }
  }
  return data;
}

function normalizeFieldFromRow(
  raw: unknown,
  prop: string,
  config: CollectionFormConfig
): unknown {
  const field = config.sections
    .flatMap(s => s.fields)
    .find(f => f.prop === prop);
  if (!field) return raw;

  if (field.type === "image") {
    if (Array.isArray(raw) && raw.length > 0) {
      const first = raw[0];
      const url =
        typeof first === "string"
          ? first
          : ((first as { url?: string })?.url ?? "");
      return normalizeMediaPublicUrl(url);
    }
    if (raw && typeof raw === "object" && "url" in raw) {
      return normalizeMediaPublicUrl(
        String((raw as { url?: string }).url ?? "")
      );
    }
    return typeof raw === "string" ? normalizeMediaPublicUrl(raw) : (raw ?? "");
  }

  if (field.type === "image-object") {
    if (typeof raw === "string" && raw) {
      const url = normalizeMediaPublicUrl(raw);
      return {
        url,
        name: "banner_image",
        extname: url.split(".").pop() || "jpg"
      };
    }
    if (raw && typeof raw === "object" && "url" in raw) {
      return {
        ...raw,
        url: normalizeMediaPublicUrl(
          String((raw as { url?: string }).url ?? "")
        )
      };
    }
    return raw ?? null;
  }

  if (field.type === "date") {
    return unwrapMongoDate(raw);
  }

  if (field.type === "string-list" || field.type === "multi-select") {
    if (field.type === "multi-select" && Array.isArray(raw)) return raw;
    return parseStringList(raw);
  }

  if (field.type === "number-list") {
    return parseNumberList(raw);
  }

  if (field.type === "geo-point") {
    return parseGeoPoint(raw);
  }

  if (
    field.type === "text" &&
    (field.disabled || field.prop.endsWith("_time"))
  ) {
    const dateText = unwrapMongoDate(raw);
    return dateText || (raw == null ? "" : String(raw));
  }

  return raw;
}

/** 表单值序列化回 Mongo 文档字段 */
export function formDataToDocument(
  form: Record<string, unknown>,
  config: CollectionFormConfig
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const fields = config.sections.flatMap(s => s.fields);

  for (const field of fields) {
    if (
      field.type === "project-search" ||
      field.type === "tag-search" ||
      field.type === "doc-id"
    )
      continue;

    const val = form[field.prop];
    if (field.disabled) {
      if (
        field.type === "text" &&
        val !== undefined &&
        val !== null &&
        val !== ""
      ) {
        out[field.prop] = val;
      }
      continue;
    }

    if (val === undefined) continue;

    if (field.type === "image") {
      out[field.prop] =
        typeof val === "string" ? normalizeMediaPublicUrl(val) : "";
      continue;
    }

    if (field.type === "image-object") {
      if (val && typeof val === "object" && "url" in val) {
        out[field.prop] = {
          ...val,
          url: normalizeMediaPublicUrl(
            String((val as { url?: string }).url ?? "")
          )
        };
      } else if (typeof val === "string" && val) {
        out[field.prop] = { url: normalizeMediaPublicUrl(val) };
      } else {
        out[field.prop] = null;
      }
      continue;
    }

    if (field.type === "number") {
      out[field.prop] =
        val === "" || val === null || val === undefined ? null : Number(val);
      continue;
    }

    if (field.type === "string-list") {
      out[field.prop] = serializeStringList(val);
      continue;
    }

    if (field.type === "multi-select") {
      out[field.prop] = Array.isArray(val) ? val : serializeStringList(val);
      continue;
    }

    if (field.type === "number-list") {
      out[field.prop] = serializeNumberList(val);
      continue;
    }

    if (field.type === "geo-point") {
      out[field.prop] = serializeGeoPoint(val);
      continue;
    }

    if (field.type === "date") {
      out[field.prop] = val === "" || val == null ? null : val;
      continue;
    }

    if (field.prop === "land_acquisition_price") {
      out[field.prop] = serializeLandAcquisitionPrice(val);
      continue;
    }

    out[field.prop] = val;
  }
  return out;
}

export function validateFormData(
  form: Record<string, unknown>,
  config: CollectionFormConfig
): string | null {
  for (const field of config.sections.flatMap(s => s.fields)) {
    if (field.type === "project-search" || field.type === "tag-search") {
      if (!field.required || !field.bindProp) continue;
      const bound = form[field.bindProp];
      if (bound === undefined || bound === null || bound === "") {
        return field.type === "tag-search"
          ? `请选择${field.label}`
          : `请选择${field.label}`;
      }
      continue;
    }
    if (!field.required) continue;
    const val = form[field.prop];
    if (field.type === "image") {
      if (!val || (typeof val === "string" && !val.trim())) {
        return `请上传${field.label}`;
      }
    } else if (field.type === "image-object") {
      const url =
        val && typeof val === "object" && "url" in val
          ? String((val as { url?: string }).url ?? "")
          : "";
      if (!url) return `请上传${field.label}`;
    } else if (field.type === "geo-point") {
      const geo = val as { lng?: number; lat?: number } | undefined;
      if (
        geo?.lng == null ||
        geo?.lat == null ||
        !Number.isFinite(Number(geo.lng)) ||
        !Number.isFinite(Number(geo.lat))
      ) {
        return `请填写${field.label}`;
      }
    } else if (val === undefined || val === null || val === "") {
      return `请填写${field.label}`;
    }
  }
  return null;
}
