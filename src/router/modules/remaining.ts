const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false
    }
  },
  // 全屏403（无权访问）页面
  {
    path: "/access-denied",
    name: "AccessDenied",
    component: () => import("@/views/error/403.vue"),
    meta: {
      title: "403",
      showLink: false
    }
  },
  // 全屏500（服务器出错）页面
  {
    path: "/server-error",
    name: "ServerError",
    component: () => import("@/views/error/500.vue"),
    meta: {
      title: "500",
      showLink: false
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  {
    path: "/business/property-project-tag/manage",
    component: Layout,
    meta: {
      title: "楼盘标签管理",
      showLink: false
    },
    children: [
      {
        path: "",
        name: "BusinessPropertyProjectTagManage",
        component: () =>
          import("@/views/business/property-project-tag/manage.vue"),
        meta: {
          title: "楼盘标签管理",
          showLink: false,
          activePath: "/business/property-project/index"
        }
      }
    ]
  },
  {
    path: "/business/property-project-image/manage",
    component: Layout,
    meta: {
      title: "楼盘图片管理",
      showLink: false
    },
    children: [
      {
        path: "",
        name: "BusinessPropertyProjectImageManage",
        component: () =>
          import("@/views/business/property-project-image/manage.vue"),
        meta: {
          title: "楼盘图片管理",
          showLink: false,
          activePath: "/business/property-project/index"
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
