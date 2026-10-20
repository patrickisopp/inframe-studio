/* inframe.studios — smooth scroll, line-by-line text reveals, sliders */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".header");

  /* ---------------------------------------------------------------------
     Smooth scroll (Lenis), with native scrolling as the fallback
     --------------------------------------------------------------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.25, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
  }

  function scrollToTarget(target) {
    var offset = -(header ? header.offsetHeight * 0.6 : 0);
    if (lenis) lenis.scrollTo(target, { offset: offset });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link) return;
    var url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    var target = document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
    history.replaceState(null, "", url.hash);
  });

  // arriving from another page with a hash (e.g. sessions.html -> index.html#contact)
  window.addEventListener("load", function () {
    if (location.hash) {
      var t = document.querySelector(location.hash);
      if (t) setTimeout(function () { scrollToTarget(t); }, 150);
    }
  });

  /* ---------------------------------------------------------------------
     Header: solid after the hero, hides on scroll down, returns on scroll up
     --------------------------------------------------------------------- */
  var lastY = window.scrollY;
  var hero = document.querySelector(".hero");
  var heroMedia = document.querySelector(".hero__media");
  var floaters = document.querySelectorAll("[data-speed]");

  function onScroll() {
    var y = window.scrollY;
    if (header) {
      var threshold = hero ? hero.offsetHeight - header.offsetHeight : 10;
      header.classList.toggle("is-solid", y > threshold);
      var goingDown = y > lastY && y > 200;
      if (!document.documentElement.classList.contains("menu-open")) header.classList.toggle("is-hidden", goingDown);
    }
    if (heroMedia && !reduceMotion && y < window.innerHeight * 1.2) {
      heroMedia.style.transform = "translate3d(0," + (y * 0.3).toFixed(1) + "px,0)";
    }
    if (!reduceMotion) {
      for (var i = 0; i < floaters.length; i++) {
        floaters[i].style.transform = "translate3d(0," + (y * -parseFloat(floaters[i].dataset.speed)).toFixed(1) + "px,0)";
      }
    }
    lastY = y;
  }
  if (lenis) lenis.on("scroll", onScroll); else window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var burger = document.querySelector(".burger");
  function closeMenu() {
    document.documentElement.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.documentElement.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
      if (header) header.classList.remove("is-hidden");
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  /* ---------------------------------------------------------------------
     Split text into masked lines
     --------------------------------------------------------------------- */
  function splitLines(el) {
    if (!el.dataset.source) el.dataset.source = el.innerHTML;
    el.innerHTML = el.dataset.source;

    // 1. wrap every word (and inline elements such as the red dot) in a measurable span
    var words = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "word";
          w.style.display = "inline-block";
          w.textContent = part;
          frag.appendChild(w);
          words.push(w);
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== "BR") {
        var w = document.createElement("span");
        w.className = "word";
        w.style.display = "inline-block";
        el.replaceChild(w, node);
        w.appendChild(node);
        words.push(w);
      }
    });

    // 2. group words by their rendered line; glue a word to the previous one if no space separated them
    var lines = [];
    var top = null;
    words.forEach(function (w) {
      var t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 2) { lines.push([]); top = t; }
      var prev = w.previousSibling;
      lines[lines.length - 1].push({ el: w, glued: prev && prev.nodeType === 1 });
    });

    // 3. rebuild as .line > .line__inner
    el.innerHTML = "";
    lines.forEach(function (line, i) {
      var outer = document.createElement("span");
      outer.className = "line";
      var inner = document.createElement("span");
      inner.className = "line__inner";
      inner.style.setProperty("--i", i);
      line.forEach(function (item, j) {
        if (j > 0 && !item.glued) inner.appendChild(document.createTextNode(" "));
        while (item.el.firstChild) inner.appendChild(item.el.firstChild);
      });
      outer.appendChild(inner);
      el.appendChild(outer);
    });
    el.classList.add("is-split");
  }

  var splitEls = Array.prototype.slice.call(document.querySelectorAll("[data-split]"));

  function splitAll() { splitEls.forEach(splitLines); }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    splitAll();
    observeReveals();
  });

  var lastWidth = window.innerWidth;
  var resizeTimer;
  window.addEventListener("resize", function () {
    if (window.innerWidth === lastWidth) return; // ignore mobile URL-bar height changes
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(splitAll, 150);
  });

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  function observeReveals() {
    var els = document.querySelectorAll("[data-split], [data-reveal], [data-draw], [data-img]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.01 });

    // Belt and braces: some browsers (background tabs, embedded previews) delay or skip
    // observer callbacks, so also check positions directly on scroll and on a slow timer.
    var pending = Array.prototype.slice.call(els);
    function checkPending() {
      var loading = document.documentElement.classList.contains("is-loading");
      var vh = window.innerHeight;
      pending = pending.filter(function (el) {
        if (el.classList.contains("is-in")) return false;
        // the hero is revealed by the loading screen when it lifts
        if (loading && el.closest(".hero")) return true;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add("is-in"); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", checkPending);
        clearInterval(pendingTimer);
      }
    }
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
    window.addEventListener("scroll", checkPending, { passive: true });
    if (lenis) lenis.on("scroll", checkPending);
    var pendingTimer = setInterval(checkPending, 400);
    checkPending();
  }

  /* ---------------------------------------------------------------------
     Sliders: arrows + drag/swipe
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-slider]"), function (root) {
    var slider = root.querySelector(".slider");
    var track = root.querySelector(".slider__track");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var loop = root.hasAttribute("data-loop");
    var index = 0;
    var x = 0;

    function slides() { return Array.prototype.slice.call(track.children); }
    function maxX() { return Math.max(0, track.scrollWidth - slider.clientWidth + parseFloat(getComputedStyle(slider).paddingLeft || 0)); }

    function go(i) {
      var s = slides();
      if (loop) i = (i + s.length) % s.length;
      index = Math.max(0, Math.min(i, s.length - 1));
      x = Math.min(s[index].offsetLeft, loop ? Infinity : maxX());
      track.style.transform = "translate3d(" + -x + "px,0,0)";
      if (!loop) {
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = x >= maxX() - 1;
      }
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    var startX = 0, startY = 0, dx = 0, dragging = false, locked = false;
    slider.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true; locked = false; dx = 0;
      startX = e.clientX; startY = e.clientY;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (!locked) {
        if (Math.abs(e.clientY - startY) > Math.abs(dx) && Math.abs(e.clientY - startY) > 6) { dragging = false; return; }
        if (Math.abs(dx) > 6) { locked = true; slider.classList.add("is-dragging"); }
      }
      if (locked) track.style.transform = "translate3d(" + (-x + dx) + "px,0,0)";
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove("is-dragging");
      if (!locked) return;
      if (dx < -50) go(index + 1); else if (dx > 50) go(index - 1); else go(index);
    });
    // stop a drag from also following a link
    slider.addEventListener("click", function (e) { if (locked) { e.preventDefault(); locked = false; } }, true);

    window.addEventListener("resize", function () { go(index); });
    window.addEventListener("load", function () { go(index); });
    go(0);
  });

  /* ---------------------------------------------------------------------
     Accordions (<details class="acc">) with a smooth height animation
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".acc"), function (acc) {
    var summary = acc.querySelector("summary");
    var body = acc.querySelector(".acc__body");
    var anim = null;
    var duration = reduceMotion ? 0 : 450;
    var easing = "cubic-bezier(0.19, 1, 0.22, 1)";

    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      var opening = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", opening);
      if (opening) acc.open = true;
      var full = body.scrollHeight;
      var from = opening ? 0 : body.offsetHeight;
      var to = opening ? full : 0;
      if (!body.animate) { acc.open = opening; return; }
      anim = body.animate([{ height: from + "px" }, { height: to + "px" }], { duration: duration, easing: easing });
      anim.onfinish = function () {
        anim = null;
        if (!opening) acc.open = false;
        if (lenis) lenis.resize();
      };
    });
  });

  /* ---------------------------------------------------------------------
     Videos: a poster with a play button; data-src (mp4, YouTube or Vimeo
     link) loads the real player on click
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".video[data-src]"), function (box) {
    var btn = box.querySelector(".video__play");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var src = box.dataset.src;
      if (!src) return; // no video added yet
      var player;
      var yt = src.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
      var vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (yt || vimeo) {
        player = document.createElement("iframe");
        player.src = yt ? "https://www.youtube-nocookie.com/embed/" + yt[1] + "?autoplay=1&rel=0"
                        : "https://player.vimeo.com/video/" + vimeo[1] + "?autoplay=1";
        player.allow = "autoplay; fullscreen; picture-in-picture";
        player.allowFullscreen = true;
      } else {
        player = document.createElement("video");
        player.src = src;
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
      }
      // swap the silent preview loop (if any) for the real player
      var loop = box.querySelector("video.preview");
      if (loop) loop.remove();
      box.appendChild(player);
      box.classList.add("is-playing");
    });
  });

  /* ---------------------------------------------------------------------
     Hero title: size the word so it spans the full width
     --------------------------------------------------------------------- */
  var heroTitle = document.querySelector(".hero__title");
  function fitHeroTitle() {
    if (!heroTitle) return;
    var inner = heroTitle.querySelector(".line__inner");
    heroTitle.style.fontSize = "100px";
    var natural = inner.getBoundingClientRect().width;
    if (natural) heroTitle.style.fontSize = (100 * heroTitle.clientWidth / natural).toFixed(2) + "px";
  }
  if (heroTitle) {
    fitHeroTitle();
    fontsReady.then(fitHeroTitle);
    window.addEventListener("resize", fitHeroTitle);
  }

  /* ---------------------------------------------------------------------
     Loading screen (homepage): logo on brand red, then the panel lifts,
     the photo settles and the hero type rises in
     --------------------------------------------------------------------- */
  var loader = document.querySelector(".loader");
  var root = document.documentElement;

  function revealHero() {
    if (heroTitle) heroTitle.classList.add("is-in");
    Array.prototype.forEach.call(document.querySelectorAll(".hero [data-reveal]"), function (el) { el.classList.add("is-in"); });
  }

  if (loader && root.classList.contains("is-loading")) {
    if (lenis) lenis.stop();
    var heroImg = document.querySelector(".hero__img");
    var imgReady = new Promise(function (resolve) {
      if (!heroImg || heroImg.complete) return resolve();
      heroImg.addEventListener("load", resolve);
      heroImg.addEventListener("error", resolve);
    });
    var minTime = new Promise(function (resolve) { setTimeout(resolve, 1600); });
    var maxTime = new Promise(function (resolve) { setTimeout(resolve, 4000); });

    Promise.race([Promise.all([imgReady, fontsReady, minTime]), maxTime]).then(function () {
      window.scrollTo(0, 0);
      fitHeroTitle();
      loader.classList.add("is-leaving");
      root.classList.remove("is-loading"); // photo starts zooming out
      setTimeout(revealHero, 350);
      setTimeout(function () {
        loader.remove();
        if (lenis) lenis.start();
      }, 1200);
    });
  } else {
    if (loader) loader.remove();
    fontsReady.then(function () { requestAnimationFrame(revealHero); });
  }

  /* ---------------------------------------------------------------------
     Hero reviews: auto-advancing, swipeable one-liners
     --------------------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-reviews]"), function (box) {
    var track = box.querySelector(".reviews__track");
    var items = track.children;
    var dotsWrap = box.querySelector(".reviews__dots");
    var index = 0;
    var timer = null;
    var dots = [];

    Array.prototype.forEach.call(items, function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.tabIndex = -1;
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function go(i) {
      index = (i + items.length) % items.length;
      track.style.transform = "translate3d(" + (-index * 100) + "%,0,0)";
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === index); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { go(index + 1); }, 3800);
    }

    var startX = 0, dx = 0, dragging = false;
    box.addEventListener("pointerdown", function (e) { dragging = true; startX = e.clientX; dx = 0; box.classList.add("is-dragging"); });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = "translate3d(calc(" + (-index * 100) + "% + " + dx + "px),0,0)";
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      box.classList.remove("is-dragging");
      if (dx < -30) go(index + 1); else if (dx > 30) go(index - 1); else go(index);
      restart();
    });

    go(0);
    restart();
  });

  /* ---------------------------------------------------------------------
     Muted preview loops: only play while on screen
     --------------------------------------------------------------------- */
  var previews = document.querySelectorAll("video.preview");
  if (previews.length && "IntersectionObserver" in window && !reduceMotion) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    Array.prototype.forEach.call(previews, function (v) { vio.observe(v); });
  }

  /* ---------------------------------------------------------------------
     Contact form: opens the visitor's mail app with the details filled in
     (swap for Formspree / Netlify Forms etc. once the site is hosted)
     --------------------------------------------------------------------- */
  var form = document.querySelector("[data-contact]");
  if (form) {
    // ?session=inscene preselects that session (service pages link here)
    var params = new URLSearchParams(location.search);
    var wanted = params.get("session");
    if (wanted && form.session && form.session.querySelector('option[value="' + wanted + '"]')) form.session.value = wanted;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var name = (d.get("first") + " " + d.get("last")).trim();
      var body = [
        "Name: " + name,
        "Phone: " + (d.get("phone") || "-"),
        "Email: " + d.get("email"),
        "Session: " + (form.session ? form.session.options[form.session.selectedIndex].text : "-"),
        "",
        d.get("message") || ""
      ].join("\n");
      location.href = "mailto:contact@inframe.studio?subject=" + encodeURIComponent("Session enquiry — " + name) + "&body=" + encodeURIComponent(body);
      var note = form.querySelector(".form__note");
      if (note) note.textContent = "Thanks! Your email app should open now — just hit send.";
    });
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
