/**
 * mfm-admin doc · Diátaxis 四象限导航
 */
(function (global) {
  var C4_WORKSPACE = "../mfm-uniapp-vue3/doc/explanation/c4-workspace.html";

  var NAV = [
    { id: "index", href: "index.html", label: "文档门户", group: "入口" },
    {
      id: "tutorial-index",
      href: "tutorial/index.html",
      label: "Tutorial · 门户",
      group: "Tutorial"
    },
    {
      id: "tutorial-getting-started",
      href: "tutorial/getting-started.html",
      label: "入门教程",
      group: "Tutorial"
    },
    {
      id: "how-to-index",
      href: "how-to/index.html",
      label: "How-to · 门户",
      group: "How-to"
    },
    {
      id: "conventions",
      href: "how-to/conventions.html",
      label: "编码约定",
      group: "How-to"
    },
    {
      id: "testing",
      href: "how-to/testing.html",
      label: "测试与验收",
      group: "How-to"
    },
    {
      id: "deployment",
      href: "how-to/deployment.html",
      label: "构建与环境",
      group: "How-to"
    },
    {
      id: "reference-index",
      href: "reference/index.html",
      label: "Reference · 门户",
      group: "Reference"
    },
    {
      id: "auth-session",
      href: "reference/auth-session.html",
      label: "鉴权与会话",
      group: "Reference"
    },
    {
      id: "dynamic-routes",
      href: "reference/dynamic-routes.html",
      label: "动态菜单与路由",
      group: "Reference"
    },
    {
      id: "collections-crud",
      href: "reference/collections-crud.html",
      label: "集合 CRUD",
      group: "Reference"
    },
    {
      id: "http-client",
      href: "reference/http-client.html",
      label: "HTTP 客户端",
      group: "Reference"
    },
    {
      id: "pinia-state",
      href: "reference/pinia-state.html",
      label: "Pinia 状态",
      group: "Reference"
    },
    {
      id: "layout-shell",
      href: "reference/layout-shell.html",
      label: "Layout 壳层",
      group: "Reference"
    },
    {
      id: "explanation-index",
      href: "explanation/index.html",
      label: "Explanation · 门户",
      group: "Explanation"
    },
    {
      id: "c4-workspace",
      href: C4_WORKSPACE,
      label: "C4 Workspace · L1",
      group: "Explanation"
    },
    {
      id: "c4-container",
      href: "explanation/c4-container.html",
      label: "C4 Container · L2",
      group: "Explanation"
    },
    {
      id: "c4-component",
      href: "explanation/c4-component.html",
      label: "C4 Component · L3",
      group: "Explanation"
    },
    {
      id: "admin-api",
      href: "explanation/admin-api.html",
      label: "Admin API 边界",
      group: "Explanation"
    }
  ];

  function detectBase() {
    var path = global.location.pathname || "";
    if (
      path.includes("/tutorial/") ||
      path.includes("/how-to/") ||
      path.includes("/reference/") ||
      path.includes("/explanation/")
    )
      return "../";
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
      '<div class="brand"><div class="eyebrow">Diátaxis</div><h2>mfm-admin</h2><p>运营后台</p></div>';
    Object.keys(groups).forEach(function (group) {
      html += '<div class="nav-label">' + group + '</div><nav class="nav">';
      groups[group].forEach(function (item) {
        var href =
          item.href.indexOf("../") === 0 ? item.href : base + item.href;
        var cls =
          item.id === activeId ? ' class="is-active" aria-current="page"' : "";
        html += '<a href="' + href + '"' + cls + ">" + item.label + "</a>";
      });
      html += "</nav>";
    });
    html +=
      '<div class="side-note">Admin API 以 mfm-api OpenAPI <code>/api/docs</code>（admin tag）为准。</div>';
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

  function init(opts) {
    opts = opts || {};
    var base = detectBase();
    if (opts.portal) {
      initPortalSearch();
      return;
    }
    renderSidebar(
      document.getElementById("doc-sidebar"),
      opts.pageId || "",
      base
    );
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
