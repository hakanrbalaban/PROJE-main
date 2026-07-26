(function () {
  "use strict";

  var cats = window.MG_CATEGORIES || {};
  var articles = window.MG_ARTICLES || {};
  var params = new URLSearchParams(window.location.search);
  var activeSlug = (params.get("cat") || "dunya").toLowerCase();
  var searchQuery = "";
  var sortBy = "date";
  var viewMode = "grid";

  function parseViews(v) {
    if (typeof v === "number") return v;
    return parseInt(String(v || "0").replace(/\./g, ""), 10) || 0;
  }

  function articleUrl(id) {
    return "article.html?id=" + encodeURIComponent(id);
  }

  function catUrl(slug) {
    return "kategori.html?cat=" + encodeURIComponent(slug);
  }

  function allArticleList() {
    return Object.keys(articles).map(function (k) {
      return articles[k];
    });
  }

  function itemsForSlug(slug) {
    var cat = cats[slug];
    if (!cat || !cat.ids) return [];
    return cat.ids
      .map(function (id) {
        return articles[id];
      })
      .filter(Boolean);
  }

  function getActiveCat() {
    return cats[activeSlug] || cats.dunya;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHtml(item, listMode) {
    if (listMode) {
      return (
        '<article class="group bg-white border border-stone-200 overflow-hidden flex flex-col sm:flex-row">' +
        '<a href="' +
        articleUrl(item.id) +
        '" class="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden block">' +
        '<img src="' +
        item.image +
        '" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">' +
        "</a>" +
        '<div class="p-4 flex-1">' +
        '<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand mb-1">' +
        escapeHtml(item.categoryLabel) +
        "</p>" +
        '<h2 class="font-display text-lg font-semibold uppercase leading-tight group-hover:text-brand transition">' +
        '<a href="' +
        articleUrl(item.id) +
        '">' +
        escapeHtml(item.title) +
        "</a></h2>" +
        '<p class="text-[13px] text-stone-500 mt-2 clamp-2">' +
        escapeHtml(item.excerpt || "") +
        "</p>" +
        '<p class="text-[11px] text-stone-500 mt-3">' +
        escapeHtml(item.date) +
        " · " +
        escapeHtml(item.author) +
        " · " +
        item.comments +
        " yorum · " +
        escapeHtml(String(item.views)) +
        " okuma</p>" +
        "</div></article>"
      );
    }

    return (
      '<article class="group bg-white border border-stone-200 overflow-hidden">' +
      '<a href="' +
      articleUrl(item.id) +
      '" class="block h-44 overflow-hidden">' +
      '<img src="' +
      item.image +
      '" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-700">' +
      "</a>" +
      '<div class="p-4">' +
      '<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-brand mb-1">' +
      escapeHtml(item.categoryLabel) +
      "</p>" +
      '<h2 class="font-display text-lg font-semibold uppercase leading-tight group-hover:text-brand transition">' +
      '<a href="' +
      articleUrl(item.id) +
      '">' +
      escapeHtml(item.title) +
      "</a></h2>" +
      '<p class="text-[11px] text-stone-500 mt-2">' +
      escapeHtml(item.date) +
      " · " +
      escapeHtml(item.author) +
      "</p>" +
      "</div></article>"
    );
  }

  function sideItemHtml(a) {
    return (
      '<a href="' +
      articleUrl(a.id) +
      '" class="group flex gap-3 items-start">' +
      '<span class="w-16 h-14 shrink-0 overflow-hidden block"><img src="' +
      a.image +
      '" alt="" class="w-full h-full object-cover"></span>' +
      "<div><h4 class=\"text-[13px] font-semibold leading-snug text-stone-800 group-hover:text-brand transition clamp-2\">" +
      escapeHtml(a.title) +
      '</h4><p class="text-[10px] text-stone-500 mt-1">' +
      escapeHtml(a.date) +
      "</p></div></a>"
    );
  }

  function filteredList() {
    var list = itemsForSlug(activeSlug).slice();
    var q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(function (a) {
        return (
          (a.title || "").toLowerCase().indexOf(q) !== -1 ||
          (a.excerpt || "").toLowerCase().indexOf(q) !== -1 ||
          (a.author || "").toLowerCase().indexOf(q) !== -1
        );
      });
    }

    list.sort(function (a, b) {
      if (sortBy === "views") return parseViews(b.views) - parseViews(a.views);
      if (sortBy === "comments") return (b.comments || 0) - (a.comments || 0);
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "", "tr");
      // date: keep category order as "newest" proxy, reverse for fresher feel
      return 0;
    });

    if (sortBy === "date") list = list.slice().reverse();
    return list;
  }

  function renderGrid() {
    var grid = document.getElementById("catGrid");
    var empty = document.getElementById("catEmpty");
    var status = document.getElementById("filterStatus");
    var list = filteredList();
    var cat = getActiveCat();

    document.getElementById("catTitle").textContent = cat.name;
    document.getElementById("catCount").textContent =
      itemsForSlug(activeSlug).length + " haber · " + list.length + " sonuç";
    document.title = cat.name + " — Magazinolog";

    if (viewMode === "list") {
      grid.className = "grid grid-cols-1 gap-4";
    } else {
      grid.className = "grid sm:grid-cols-2 gap-6";
    }

    grid.innerHTML = list
      .map(function (item) {
        return cardHtml(item, viewMode === "list");
      })
      .join("");

    empty.classList.toggle("hidden", list.length > 0);

    var parts = [];
    parts.push(cat.name);
    if (searchQuery.trim()) parts.push('"' + searchQuery.trim() + '" araması');
    if (sortBy === "views") parts.push("okunma sırası");
    if (sortBy === "comments") parts.push("yorum sırası");
    if (sortBy === "title") parts.push("A–Z");
    status.textContent = list.length + " haber · " + parts.join(" · ");
  }

  function renderChips() {
    var host = document.getElementById("filterChips");
    host.innerHTML = "";

    Object.keys(cats).forEach(function (key) {
      if (key === "gundem") return;
      var c = cats[key];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = c.name + " (" + (c.ids ? c.ids.length : 0) + ")";
      btn.className =
        "px-3 py-1.5 border text-[11px] font-bold uppercase tracking-[0.14em] transition " +
        (c.slug === activeSlug
          ? "bg-brand border-brand text-white"
          : "bg-white border-stone-300 text-stone-600 hover:border-brand hover:text-brand");
      btn.addEventListener("click", function () {
        activeSlug = c.slug;
        history.replaceState(null, "", catUrl(activeSlug));
        renderChips();
        renderTopNav();
        renderSideCats();
        renderSideFeatured();
        renderGrid();
        highlightQuick();
      });
      host.appendChild(btn);
    });
  }

  function renderTopNav() {
    var nav = document.getElementById("topCatNav");
    nav.innerHTML = "";
    Object.keys(cats).forEach(function (key) {
      if (key === "gundem") return;
      var c = cats[key];
      var a = document.createElement("a");
      a.href = catUrl(c.slug);
      a.textContent = c.name;
      a.className =
        "px-2.5 py-1.5 border transition " +
        (c.slug === activeSlug
          ? "bg-brand border-brand text-white"
          : "border-stone-200 text-stone-500 hover:border-brand hover:text-brand");
      nav.appendChild(a);
    });
  }

  function renderSideCats() {
    var ul = document.getElementById("sideCats");
    ul.innerHTML = "";
    Object.keys(cats).forEach(function (key) {
      if (key === "gundem") return;
      var c = cats[key];
      var li = document.createElement("li");
      li.className = "flex justify-between border-b border-stone-100 py-2.5";
      var active = c.slug === activeSlug;
      li.innerHTML =
        '<a href="' +
        catUrl(c.slug) +
        '" class="' +
        (active ? "text-brand font-semibold" : "text-stone-700 hover:text-brand") +
        ' transition">' +
        escapeHtml(c.name) +
        '</a><span class="' +
        (active ? "text-brand" : "text-stone-500") +
        '">' +
        (c.ids ? c.ids.length : 0) +
        "</span>";
      ul.appendChild(li);
    });
  }

  function renderSideLists() {
    var all = allArticleList();
    var popular = all
      .slice()
      .sort(function (a, b) {
        return parseViews(b.views) - parseViews(a.views);
      })
      .slice(0, 5);
    var latest = all
      .slice()
      .sort(function (a, b) {
        return (b.comments || 0) - (a.comments || 0);
      })
      .slice(0, 5);

    document.getElementById("sidePopular").innerHTML = popular.map(sideItemHtml).join("");
    document.getElementById("sideLatest").innerHTML = latest.map(sideItemHtml).join("");
  }

  function renderSideFeatured() {
    var list = itemsForSlug(activeSlug)
      .slice()
      .sort(function (a, b) {
        return parseViews(b.views) - parseViews(a.views);
      })
      .slice(0, 3);
    document.getElementById("sideFeatured").innerHTML = list.length
      ? list.map(sideItemHtml).join("")
      : '<p class="text-[13px] text-stone-500">Bu kategoride içerik yok.</p>';
  }

  function renderTags() {
    var host = document.getElementById("sideTags");
    var tags = ["Gündem", "Analiz", "Veri", "Röportaj", "Video", "Arşiv", "Yerel", "Küresel"];
    host.innerHTML = tags
      .map(function (t) {
        return (
          '<button type="button" data-tag="' +
          escapeHtml(t) +
          '" class="border border-stone-300 text-stone-500 px-3 py-1.5 hover:bg-brand hover:border-brand hover:text-white transition">' +
          escapeHtml(t) +
          "</button>"
        );
      })
      .join("");

    host.querySelectorAll("[data-tag]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("catSearch").value = btn.getAttribute("data-tag");
        searchQuery = btn.getAttribute("data-tag");
        renderGrid();
      });
    });
  }

  function initTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.forEach(function (b) {
          b.className = "tab-btn py-3 bg-stone-100 text-stone-600 hover:text-brand transition";
        });
        btn.className = "tab-btn py-3 bg-brand text-white transition";
        document.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("hidden", panel.dataset.panel !== btn.dataset.tab);
        });
      });
    });
  }

  function highlightQuick() {
    document.querySelectorAll("[data-quick]").forEach(function (btn) {
      var on = btn.getAttribute("data-quick") === sortBy;
      btn.className =
        "w-full text-left border px-3 py-2.5 text-[12px] font-semibold transition " +
        (on
          ? "border-brand bg-rose-50 text-brand"
          : "border-stone-200 hover:border-brand hover:text-brand");
    });
  }

  function initFilters() {
    document.getElementById("catSearch").addEventListener("input", function (e) {
      searchQuery = e.target.value;
      renderGrid();
    });

    document.getElementById("catSort").addEventListener("change", function (e) {
      sortBy = e.target.value;
      highlightQuick();
      renderGrid();
    });

    document.getElementById("catView").addEventListener("change", function (e) {
      viewMode = e.target.value;
      renderGrid();
    });

    document.getElementById("filterReset").addEventListener("click", function () {
      searchQuery = "";
      sortBy = "date";
      viewMode = "grid";
      document.getElementById("catSearch").value = "";
      document.getElementById("catSort").value = "date";
      document.getElementById("catView").value = "grid";
      highlightQuick();
      renderGrid();
    });

    document.querySelectorAll("[data-quick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        sortBy = btn.getAttribute("data-quick");
        document.getElementById("catSort").value = sortBy;
        highlightQuick();
        renderGrid();
      });
    });
  }

  function initNewsletter() {
    document.getElementById("newsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("newsMsg").classList.remove("hidden");
      e.target.reset();
    });
  }

  if (!cats[activeSlug]) activeSlug = "dunya";

  renderTopNav();
  renderChips();
  renderSideCats();
  renderSideLists();
  renderSideFeatured();
  renderTags();
  initTabs();
  initFilters();
  initNewsletter();
  highlightQuick();
  renderGrid();
})();
