(function () {
  "use strict";

  var ZODIAC = [
    { sign: "Koç", date: "21 Mar – 19 Nis", text: "Enerjiniz yüksek; yeni bir projeye adım atmak için uygun bir gün. Kısa yolculuklar ve ani fırsatlar kapınızı çalabilir.", love: 4, work: 5, luck: 3 },
    { sign: "Boğa", date: "20 Nis – 20 May", text: "Sabırlı yaklaşımınız sonuç veriyor. Finansal konularda temkinli olun, akşam saatleri sosyal bağlarınızı güçlendirir.", love: 5, work: 3, luck: 4 },
    { sign: "İkizler", date: "21 May – 20 Haz", text: "İletişim yıldızınız parlıyor. Yazı, toplantı ve kısa mesajlar beklenenden büyük etki yaratabilir.", love: 3, work: 5, luck: 4 },
    { sign: "Yengeç", date: "21 Haz – 22 Tem", text: "Duygusal denge ön planda. Aile ve yakın çevrenizle kuracağınız samimi bir sohbet içinizdeki yükü hafifletecek.", love: 5, work: 3, luck: 3 },
    { sign: "Aslan", date: "23 Tem – 22 Ağu", text: "Sahnede olmak size yakışıyor. Yaratıcı fikirlerinizi paylaşın; takdir görmeniz olası.", love: 4, work: 4, luck: 5 },
    { sign: "Başak", date: "23 Ağu – 22 Eyl", text: "Detaylara odaklanmak işinizi kolaylaştırır. Sağlık rutininize küçük bir iyileştirme ekleyin.", love: 3, work: 5, luck: 3 },
    { sign: "Terazi", date: "23 Eyl – 22 Eki", text: "Denge arayışınız ödüllendiriliyor. Ortaklıklar ve uzlaşmalar günün ana teması.", love: 5, work: 4, luck: 4 },
    { sign: "Akrep", date: "23 Eki – 21 Kas", text: "Sezgilerinize güvenin. Gizli kalan bir konu aydınlanabilir; sabırlı olun.", love: 4, work: 4, luck: 3 },
    { sign: "Yay", date: "22 Kas – 21 Ara", text: "Uzak planlar ve öğrenme isteği artıyor. Yeni bir rota veya kurs fikri aklınıza yatabilir.", love: 3, work: 4, luck: 5 },
    { sign: "Oğlak", date: "22 Ara – 19 Oca", text: "Disiplinli adımlarınız meyve veriyor. Kariyerde görünürlük artarken dinlenmeye de yer açın.", love: 3, work: 5, luck: 4 },
    { sign: "Kova", date: "20 Oca – 18 Şub", text: "Orijinal fikirleriniz dikkat çekiyor. Topluluk içinde paylaşmak size yeni kapılar açabilir.", love: 4, work: 4, luck: 5 },
    { sign: "Balık", date: "19 Şub – 20 Mar", text: "Hayal gücü ve empati zirvede. Sanatsal bir uğraş veya yardımlaşma günü güzelleştirir.", love: 5, work: 3, luck: 4 }
  ];

  var SEED_COMMENTS = [
    { name: "Kerem Y.", text: "Çok net bir anlatım olmuş, özellikle son paragrafı herkesin okuması lazım.", likes: 12 },
    { name: "Elif D.", text: "Kaynaklara da yer verilmiş, teşekkürler. Umarım takip haberi de gelir.", likes: 8 },
    { name: "Mert A.", text: "Benzer örnekleri başka şehirlerde de görmek isterim, güzel bir perspektif.", likes: 5 },
    { name: "Sena B.", text: "Başlık biraz iddialı ama içerik karşılıyor. Paylaşıyorum.", likes: 3 }
  ];

  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += i <= n ? "★" : "☆";
    return s;
  }

  function articleUrl(id) {
    return "article.html?id=" + encodeURIComponent(id);
  }

  function allArticles() {
    var list = [];
    var map = window.VT_ARTICLES || {};
    Object.keys(map).forEach(function (k) {
      list.push(map[k]);
    });
    return list;
  }

  function parseViews(v) {
    if (typeof v === "number") return v;
    return parseInt(String(v || "0").replace(/\./g, ""), 10) || 0;
  }

  function sideItemHtml(a) {
    return (
      '<a href="' + articleUrl(a.id) + '" class="group flex gap-3 items-start">' +
      '<span class="w-16 h-14 shrink-0 overflow-hidden block"><img src="' + a.image + '" alt="" class="w-full h-full object-cover"></span>' +
      "<div><h4 class=\"text-[13px] font-semibold leading-snug text-slate-200 group-hover:text-brand transition clamp-2\">" +
      a.title +
      '</h4><p class="text-[10px] text-slate-400 mt-1">' +
      a.date +
      "</p></div></a>"
    );
  }

  function cardHtml(a) {
    return (
      '<a href="' + articleUrl(a.id) + '" class="group block border border-white/10 overflow-hidden hover:border-brand/50 transition">' +
      '<span class="block h-40 overflow-hidden"><img src="' + a.image + '" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></span>' +
      '<div class="p-3"><p class="text-[10px] uppercase tracking-widest text-brand">' + a.categoryLabel + "</p>" +
      '<h3 class="mt-1 font-head text-[17px] font-semibold uppercase leading-tight text-white group-hover:text-brand transition clamp-2">' +
      a.title +
      '</h3><p class="text-[10px] text-slate-500 mt-2">' + a.date + " · " + a.comments + " yorum</p></div></a>"
    );
  }

  function miniCardHtml(a) {
    return (
      '<a href="' + articleUrl(a.id) + '" class="group block">' +
      '<span class="block h-28 overflow-hidden"><img src="' + a.image + '" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"></span>' +
      '<h4 class="mt-2 text-[12px] font-semibold leading-snug text-slate-200 group-hover:text-brand transition clamp-2">' +
      a.title +
      "</h4></a>"
    );
  }

  /* ========== Makale yükle ========== */
  function loadArticle() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var article = id && window.VT_ARTICLES ? window.VT_ARTICLES[id] : null;

    if (!article) {
      document.getElementById("articleLayout").classList.add("hidden");
      document.getElementById("aMissing").classList.remove("hidden");
      return null;
    }

    document.title = article.title + " — Magazinolog";
    document.getElementById("aCat").textContent = article.categoryLabel;
    document.getElementById("aCat").href = "kategori.html?cat=" + encodeURIComponent(article.category);
    document.getElementById("aTitle").textContent = article.title;
    document.getElementById("aExcerpt").textContent = article.excerpt || "";
    document.getElementById("aMeta").textContent =
      article.date + " · " + article.comments + " yorum · " + article.views + " görüntülenme";
    document.getElementById("aAuthor").textContent = article.author;
    document.getElementById("aAuthorInitial").textContent = (article.author || "M").charAt(0).toUpperCase();

    var img = document.getElementById("aImage");
    img.src = article.image;
    img.alt = article.title;
    document.getElementById("aImageCap").textContent = article.title + " — Magazinolog arşivi";

    var body = document.getElementById("aBody");
    body.innerHTML = "";
    (article.body || [article.excerpt]).forEach(function (p) {
      var el = document.createElement("p");
      el.textContent = p;
      body.appendChild(el);
    });

    document.getElementById("aCatLink").href = "kategori.html?cat=" + encodeURIComponent(article.category);
    document.getElementById("relatedMore").href = "kategori.html?cat=" + encodeURIComponent(article.category);

    var tags = document.getElementById("aTags");
    tags.innerHTML = "";
    [article.categoryLabel, "Magazinolog", "Gündem", "Analiz"].forEach(function (t) {
      var a = document.createElement("a");
      a.href = "kategori.html?cat=" + encodeURIComponent(article.category);
      a.className =
        "border border-white/15 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand hover:border-brand hover:text-white transition";
      a.textContent = t;
      tags.appendChild(a);
    });

    return article;
  }

  /* ========== Sidebar listeler ========== */
  function fillSidebars(current) {
    var list = allArticles().filter(function (a) {
      return a.id !== current.id;
    });

    var popular = list.slice().sort(function (a, b) {
      return parseViews(b.views) - parseViews(a.views);
    }).slice(0, 5);

    var latest = list.slice().sort(function (a, b) {
      return (b.comments || 0) - (a.comments || 0);
    }).slice(0, 5);

    document.getElementById("sidePopular").innerHTML = popular.map(sideItemHtml).join("");
    document.getElementById("sideLatest").innerHTML = latest.map(sideItemHtml).join("");

    document.getElementById("sideComments").innerHTML = SEED_COMMENTS.map(function (c) {
      return (
        '<div class="border-b border-white/5 pb-3">' +
        '<p class="text-[13px] text-slate-300 leading-snug clamp-3">"' + c.text + '"</p>' +
        '<p class="text-[10px] text-slate-400 mt-2"><span class="text-brand font-semibold">' +
        c.name +
        "</span> · " +
        c.likes +
        " beğeni</p></div>"
      );
    }).join("");

    var related = list
      .filter(function (a) {
        return a.category === current.category;
      })
      .slice(0, 4);
    if (related.length < 4) {
      list.forEach(function (a) {
        if (related.length >= 4) return;
        if (related.indexOf(a) === -1) related.push(a);
      });
    }
    document.getElementById("relatedGrid").innerHTML = related.map(cardHtml).join("");

    var also = list
      .filter(function (a) {
        return a.category !== current.category;
      })
      .slice(0, 6);
    document.getElementById("alsoLiked").innerHTML = also.map(miniCardHtml).join("");

    var cats = window.VT_CATEGORIES || {};
    var catHtml = "";
    Object.keys(cats).forEach(function (key) {
      if (key === "gundem") return;
      var c = cats[key];
      catHtml +=
        '<li class="flex justify-between border-b border-white/5 py-2">' +
        '<a href="kategori.html?cat=' +
        encodeURIComponent(c.slug) +
        '" class="text-slate-300 hover:text-brand transition">' +
        c.name +
        '</a><span class="text-slate-500">' +
        (c.ids ? c.ids.length : 0) +
        "</span></li>";
    });
    document.getElementById("sideCats").innerHTML = catHtml;
  }

  /* ========== Sekmeler ========== */
  function initTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.forEach(function (b) {
          b.className = "tab-btn py-3 bg-white/5 text-slate-300 hover:text-white transition";
        });
        btn.className = "tab-btn py-3 bg-brand text-white transition";
        document.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("hidden", panel.dataset.panel !== btn.dataset.tab);
        });
      });
    });
  }

  /* ========== Burç ========== */
  function initZodiac() {
    var i = new Date().getMonth() % ZODIAC.length;
    function show(n) {
      i = (n + ZODIAC.length) % ZODIAC.length;
      var z = ZODIAC[i];
      document.getElementById("zodiacSign").textContent = z.sign;
      document.getElementById("zodiacDate").textContent = z.date;
      document.getElementById("zodiacText").textContent = z.text;
      document.getElementById("zLove").textContent = stars(z.love);
      document.getElementById("zWork").textContent = stars(z.work);
      document.getElementById("zLuck").textContent = stars(z.luck);
    }
    document.getElementById("zodiacPrev").addEventListener("click", function () {
      show(i - 1);
    });
    document.getElementById("zodiacNext").addEventListener("click", function () {
      show(i + 1);
    });
    show(i);
  }

  /* ========== Yorumlar ========== */
  function initComments(article) {
    var key = "mg_comments_" + article.id;
    var listEl = document.getElementById("commentList");
    var countEl = document.getElementById("commentCount");
    var form = document.getElementById("commentForm");
    var msg = document.getElementById("commentMsg");

    function load() {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : SEED_COMMENTS.map(function (c) {
          return { name: c.name, text: c.text, likes: c.likes, time: "Az önce" };
        });
      } catch (e) {
        return SEED_COMMENTS.slice();
      }
    }

    function save(items) {
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch (e) {}
    }

    function render() {
      var items = load();
      countEl.textContent = "(" + items.length + ")";
      listEl.innerHTML = items
        .map(function (c, idx) {
          return (
            '<div class="border-b border-white/10 pb-4" data-cidx="' +
            idx +
            '">' +
            '<div class="flex items-start gap-3">' +
            '<span class="grid place-items-center w-9 h-9 rounded-full bg-brand/20 text-brand font-head font-bold text-sm shrink-0">' +
            (c.name || "?").charAt(0).toUpperCase() +
            "</span>" +
            "<div class=\"flex-1 min-w-0\">" +
            '<div class="flex flex-wrap items-center gap-2">' +
            '<p class="text-[13px] font-semibold text-white">' +
            c.name +
            '</p><p class="text-[10px] text-slate-500">' +
            (c.time || "Az önce") +
            "</p></div>" +
            '<p class="text-[14px] text-slate-300 leading-relaxed mt-1.5">' +
            c.text +
            "</p>" +
            '<button type="button" data-like-c="' +
            idx +
            '" class="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand transition">Beğen · ' +
            (c.likes || 0) +
            "</button>" +
            "</div></div></div>"
          );
        })
        .join("");

      listEl.querySelectorAll("[data-like-c]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var items2 = load();
          var ix = parseInt(btn.getAttribute("data-like-c"), 10);
          if (!items2[ix]) return;
          items2[ix].likes = (items2[ix].likes || 0) + 1;
          save(items2);
          render();
        });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName").value.trim();
      var text = document.getElementById("cText").value.trim();
      if (!name || !text) return;
      var items = load();
      items.unshift({
        name: name,
        text: text,
        likes: 0,
        time: "Az önce"
      });
      save(items);
      form.reset();
      msg.textContent = "Yorumunuz yayınlandı, teşekkürler!";
      msg.classList.remove("hidden");
      setTimeout(function () {
        msg.classList.add("hidden");
      }, 3000);
      render();
    });

    render();
  }

  /* ========== Beğen / Paylaş ========== */
  function initActions(article) {
    var likeKey = "mg_like_" + article.id;
    var countEl = document.getElementById("likeCount");
    var btn = document.getElementById("btnLike");
    var count = parseInt(localStorage.getItem(likeKey) || "0", 10);
    countEl.textContent = count;

    btn.addEventListener("click", function () {
      count += 1;
      localStorage.setItem(likeKey, String(count));
      countEl.textContent = count;
      btn.classList.add("border-brand", "text-brand");
    });

    document.getElementById("btnShare").addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          alert("Bağlantı panoya kopyalandı.");
        });
      } else {
        prompt("Paylaşmak için bağlantıyı kopyalayın:", url);
      }
    });
  }

  /* ========== Anket ========== */
  function initPoll(article) {
    var form = document.getElementById("pollForm");
    var result = document.getElementById("pollResult");
    var key = "mg_poll_" + article.id;

    function showResults(choice) {
      var base = { paylas: 34, yorum: 28, benzer: 22, arsiv: 16 };
      if (choice && base[choice] != null) base[choice] += 1;
      var labels = {
        paylas: "Sosyal medyada paylaşmak",
        yorum: "Yorum yazmak",
        benzer: "Benzer haberleri okumak",
        arsiv: "Arşive kaydetmek"
      };
      form.classList.add("hidden");
      result.classList.remove("hidden");
      result.innerHTML = Object.keys(base)
        .map(function (k) {
          return (
            '<div><div class="flex justify-between mb-1"><span class="text-slate-300">' +
            labels[k] +
            '</span><span class="text-brand font-semibold">%' +
            base[k] +
            '</span></div><div class="h-1.5 bg-white/10"><div class="h-full bg-brand" style="width:' +
            base[k] +
            '%"></div></div></div>'
          );
        })
        .join("");
    }

    if (localStorage.getItem(key)) {
      showResults(localStorage.getItem(key));
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var selected = form.querySelector('input[name="poll"]:checked');
      if (!selected) return;
      localStorage.setItem(key, selected.value);
      showResults(selected.value);
    });
  }

  /* ========== Bülten ========== */
  function initNewsletter() {
    document.getElementById("newsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("newsMsg").classList.remove("hidden");
      e.target.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var article = loadArticle();
    if (!article) return;
    fillSidebars(article);
    initTabs();
    initZodiac();
    initComments(article);
    initActions(article);
    initPoll(article);
    initNewsletter();
  });
})();
