/**
 * mfm-admin doc 套件公共脚本 · 无外部依赖
 * 侧栏导航、面包屑、门户搜索/筛选
 */
(function (global) {
  /** @type {{ id: string; href: string; label: string; group: string }[]} */
  var NAV = [
    { id: "index", href: "index.html", label: "文档门户", group: "入口" },
    {
      id: "architecture",
      href: "architecture.html",
      label: "系统架构",
      group: "核心"
    },
    {
      id: "admin-api",
      href: "admin-api.html",
      label: "Admin API 边界",
      group: "核心"
    },
    {
      id: "conventions",
      href: "conventions.html",
      label: "编码约定",
      group: "核心"
    },
    {
      id: "auth-session",
      href: "modules/auth-session.html",
      label: "鉴权与会话",
      group: "模块"
    },
    {
      id: "dynamic-routes",
      href: "modules/dynamic-routes.html",
      label: "动态菜单与路由",
      group: "模块"
    },
    {
      id: "collections-crud",
      href: "modules/collections-crud.html",
      label: "集合 CRUD",
      group: "模块"
    },
    {
      id: "http-client",
      href: "modules/http-client.html",
      label: "HTTP 客户端",
      group: "模块"
    },
    {
      id: "pinia-state",
      href: "modules/pinia-state.html",
      label: "Pinia 状态",
      group: "模块"
    },
    {
      id: "layout-shell",
      href: "modules/layout-shell.html",
      label: "Layout 壳层",
      group: "模块"
    },
    {
      id: "deployment",
      href: "pages/deployment.html",
      label: "构建与环境",
      group: "运维"
    },
    {
      id: "testing",
      href: "pages/testing.html",
      label: "测试与验收",
      group: "运维"
    }
  ];

  function detectBase() {
    var path = global.location.pathname || "";
    if (path.includes("/modules/") || path.includes("/pages/")) return "../";
    return "./";
  }

  function renderSidebar(container, activeId, base) {
    if (!container) return;
    var groups = {};
    NAV.forEach(function (item) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    var html =
      '<div class="brand"><div class="eyebrow">Agent 文档</div><h2>mfm-admin</h2><p>运营后台协作文档套件</p></div>';
    Object.keys(groups).forEach(function (group) {
      html += '<div class="nav-label">' + group + '</div><nav class="nav">';
      groups[group].forEach(function (item) {
        var cls =
          item.id === activeId ? ' class="is-active" aria-current="page"' : "";
        html +=
          '<a href="' +
          base +
          item.href +
          '"' +
          cls +
          ">" +
          item.label +
          "</a>";
      });
      html += "</nav>";
    });
    html +=
      '<div class="side-note">Admin API 契约以 mfm-api OpenAPI <code>/api/docs</code>（admin tag）为准。</div>';
    container.innerHTML = html;
  }

  function renderBreadcrumb(container, title, base) {
    if (!container) return;
    container.innerHTML =
      '<a href="' +
      base +
      'index.html">文档门户</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-current">' +
      title +
      "</span>";
  }

  function initPortalSearch() {
    var input = document.getElementById("doc-search");
    var cards = document.querySelectorAll("[data-doc-card]");
    var tags = document.querySelectorAll(".filter-tag");
    if (!input && !tags.length) return;

    var activeTag = "all";

    function filter() {
      var q = (input && input.value ? input.value : "").trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.textContent || "").toLowerCase();
        var tag = card.getAttribute("data-tag") || "";
        var matchQ = !q || text.indexOf(q) >= 0;
        var matchTag =
          activeTag === "all" || tag.split(" ").indexOf(activeTag) >= 0;
        card.classList.toggle("is-hidden", !(matchQ && matchTag));
      });
    }

    if (input) input.addEventListener("input", filter);
    tags.forEach(function (tagEl) {
      tagEl.addEventListener("click", function () {
        tags.forEach(function (t) {
          t.classList.remove("is-active");
        });
        tagEl.classList.add("is-active");
        activeTag = tagEl.getAttribute("data-filter") || "all";
        filter();
      });
    });
  }

  /**
   * @param {{ pageId?: string; title?: string; portal?: boolean }} opts
   */
  function init(opts) {
    opts = opts || {};
    var base = detectBase();
    var activeId = opts.pageId || "";

    if (opts.portal) {
      initPortalSearch();
      return;
    }

    renderSidebar(document.getElementById("doc-sidebar"), activeId, base);
    renderBreadcrumb(
      document.getElementById("doc-breadcrumb"),
      opts.title || document.title,
      base
    );

    var back = document.getElementById("doc-back-home");
    if (back) back.setAttribute("href", base + "index.html");
  }

  global.DocShell = { init: init, NAV: NAV };
})(typeof window !== "undefined" ? window : globalThis);
