/* Smarta landing page interactions. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var fmtKsh = function (n) { return "KSh " + Math.round(n).toLocaleString("en-KE"); };

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add("loaded"); });
  });

  /* ---------------------------------------------------------------
     Scroll engine: every scene gets a 0..1 progress for its element.
     start/end are viewport fractions where progress is 0 and 1.
  --------------------------------------------------------------- */
  var scenes = [];
  function scene(el, start, end, fn) {
    if (el) scenes.push({ el: el, start: start, end: end, fn: fn });
  }
  function runScenes() {
    var vh = window.innerHeight;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var r = s.el.getBoundingClientRect();
      // progress 0 when element top reaches vh*start, 1 when element bottom reaches vh*end
      var st = typeof s.start === "function" ? s.start() : s.start;
      var en = typeof s.end === "function" ? s.end() : s.end;
      var from = vh * st;
      var total = r.height + from - vh * en;
      var p = total > 0 ? clamp((from - r.top) / total, 0, 1) : 1;
      if (p !== s.last) { s.last = p; s.fn(p, r); }
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      flowbar.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
      runScenes();
    });
  }
  var flowbar = $("#flowbar");
  var nav = $("#nav");

  /* ---------------------------------------------------------------
     Hero meter: odometer wheels, leak-indicator star, valve control
  --------------------------------------------------------------- */
  (function heroMeter() {
    var odo = $("#odo");
    var stage = $("#meterStage");
    var meter = $("#heroMeter");
    if (!odo || !stage) return;

    var places = [10000000, 1000000, 100000, 10000, 1000, 100, 10, 1];
    odo.innerHTML = "";
    var cols = places.map(function (p) {
      var w = document.createElement("span");
      w.className = "wheel" + (p < 1000 ? " red" : "");
      var c = document.createElement("span");
      c.className = "col";
      for (var d = 0; d <= 10; d++) {
        var n = document.createElement("span");
        n.textContent = d % 10;
        c.appendChild(n);
      }
      w.appendChild(c);
      odo.appendChild(w);
      return c;
    });

    function wheelPos(L, p) {
      var v = L / p;
      var d = Math.floor(v) % 10;
      if (p === 1) return v % 10;
      var rem = L % p;
      var thr = p - 1;
      return rem > thr ? d + (rem - thr) : d;
    }

    var L0 = 482317.2;
    var L = L0;
    var credit0 = 12.4;
    var flow = 12.4; // L/min
    var closed = false;
    var star = $("#star");
    var starAngle = 0;
    var lcdCredit = $("#lcdCredit");
    var lcdValve = $("#lcdValve");
    var chipFlow = $("#chipFlow");
    var chipValve = $("#chipValve");
    var chipValveWrap = $("#chipValveWrap");
    var toggle = $("#valveToggle");
    var toggleLabel = $("#valveToggleLabel");
    var visible = true;
    var last = performance.now();
    var tAcc = 0;

    function draw() {
      for (var i = 0; i < places.length; i++) {
        cols[i].style.transform = "translateY(" + (-(wheelPos(L, places[i]) / 11) * 100).toFixed(3) + "%)";
      }
      var credit = Math.max(0, credit0 - (L - L0) / 1000);
      lcdCredit.textContent = credit.toFixed(3);
      star.style.transform = "rotate(" + starAngle.toFixed(1) + "deg)";
      chipFlow.textContent = flow.toFixed(1) + " L/min";
    }

    function frame(now) {
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tAcc += dt;
      if (visible) {
        var target = closed ? 0 : 12.4 + Math.sin(tAcc * 0.7) * 0.35 + Math.sin(tAcc * 2.3) * 0.12;
        flow += (target - flow) * Math.min(1, dt * (closed ? 2.2 : 3));
        if (flow < 0.05) flow = 0;
        L += (flow / 60) * dt;
        starAngle = (starAngle + flow * dt * 28) % 360;
        draw();
      }
      requestAnimationFrame(frame);
    }

    draw();
    if (!reduce) requestAnimationFrame(frame);


    toggle.addEventListener("click", function () {
      closed = !closed;
      toggle.setAttribute("aria-pressed", String(closed));
      toggleLabel.textContent = closed ? "Turn the water back on" : "Turn off water to this unit";
      stage.classList.toggle("is-closed", closed);
      chipValve.textContent = closed ? "Turning off…" : "Turning on…";
      lcdValve.textContent = "Valve ···";
      setTimeout(function () {
        chipValve.textContent = closed ? "Off" : "On";
        lcdValve.textContent = closed ? "Valve closed" : "Valve open";
        chipValveWrap.classList.toggle("is-alert", closed);
        if (reduce) { flow = closed ? 0 : 12.4; draw(); }
      }, 1200);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);
    }

    if (finePointer && !reduce) {
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        meter.style.transform = "rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
      });
      stage.addEventListener("pointerleave", function () { meter.style.transform = ""; });
    }
  })();

  /* ---------------------------------------------------------------
     Hero depth: grid, meter and readouts drift apart as you leave
  --------------------------------------------------------------- */
  (function heroDepth() {
    var hero = $("#hero"), bg = $("#heroBg"), stage = $("#meterStage");
    if (!hero || reduce) return;
    var chips = $$(".chip", stage);
    scene(hero, 0, -0.2, function (p) {
      bg.style.transform = "translateY(" + (p * 60).toFixed(1) + "px)";
      chips.forEach(function (c, i) {
        c.style.translate = "0 " + (-p * (40 + i * 18)).toFixed(1) + "px";
      });
    });
  })();

  /* ---------------------------------------------------------------
     The postpaid month: a red line that runs across the days
  --------------------------------------------------------------- */
  (function month() {
    var m = $("#month");
    if (!m) return;
    var days = $$(".day", m);
    scene(m, 0.85, 0.45, function (p) {
      m.style.setProperty("--mp", p.toFixed(3));
      days.forEach(function (d, i) { d.classList.toggle("lit", p >= i / days.length + 0.02 || p === 1); });
    });
  })();

  /* ---------------------------------------------------------------
     Statement: words fill in as you scroll
  --------------------------------------------------------------- */
  (function statement() {
    var el = $("#statement");
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    var range = (el.getAttribute("data-hl") || "-1,-1").split(",").map(Number);
    el.innerHTML = words.map(function (w, i) {
      var hl = i >= range[0] && i <= range[1] ? " hl" : "";
      return '<span class="w' + hl + '">' + w + "</span>";
    }).join(" ");
    var spans = $$(".w", el);
    scene(el, 0.9, 0.5, function (p) {
      var n = Math.round(p * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle("on", i < n); });
    });
  })();

  /* ---------------------------------------------------------------
     Top-up story: one deterministic render per scroll position
  --------------------------------------------------------------- */
  (function topup() {
    var steps = $("#steps");
    if (!steps) return;
    var stepEls = $$(".step", steps);
    var stations = $$(".station");
    var byId = {};
    stations.forEach(function (s) { byId[s.getAttribute("data-station")] = s; });
    var pins = $$("#pin i");
    var stkOk = $("#stkOk");
    var live = $("#livePath");
    var tokenEl = $("#token");
    var TOKEN = "57842210991743063382";
    tokenEl.innerHTML = [0, 1, 2, 3, 4].map(function (g) {
      var h = '<span class="g">';
      for (var i = 0; i < 4; i++) h += '<span class="c" data-i="' + (g * 4 + i) + '">' + TOKEN[g * 4 + i] + "</span>";
      return h + "</span>";
    }).join("");
    var chars = $$(".c", tokenEl);
    var miniCredit = $("#miniCredit");
    var miniValve = $("#miniValve");
    var valveInd = $("#valveInd");
    var sms = $("#sms");
    var dashTotal = $("#dashTotal");
    var dashPill = $("#dashPill");
    var dashNew = $("#dashNew");
    var activeFor = [0, 1, 2, 2, 3];

    function render(p) {
      var x = clamp(p, 0, 0.99999) * 5;
      var idx = Math.floor(x);
      var t = x - idx;

      stepEls.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
      var act = activeFor[idx];
      stations.forEach(function (s) {
        var id = +s.getAttribute("data-station");
        var done = id < act || (id === 2 && idx === 3 && t > 0.55) || (id === 3 && idx === 4 && t > 0.6);
        s.classList.toggle("on", id === act);
        s.classList.toggle("done", done);
      });

      // A: PIN entry
      var pinN = idx > 0 ? 4 : Math.floor(clamp(t / 0.6, 0, 1) * 4);
      pins.forEach(function (pi, i) { pi.classList.toggle("f", i < pinN); });
      stkOk.hidden = !(idx > 0 || t > 0.72);

      // B: token digits
      var revealed = idx < 1 ? 0 : idx > 1 ? 20 : Math.floor(clamp(t / 0.8, 0, 1) * 20);
      chars.forEach(function (c, i) {
        if (i < revealed) { c.textContent = TOKEN[i]; c.className = "c"; }
        else if (idx === 1 && i < revealed + 4) { c.textContent = String((Math.random() * 10) | 0); c.className = "c s"; }
        else { c.textContent = "·"; c.className = "c p"; }
      });

      // path
      var lp = idx === 0 ? 0 : idx === 1 ? t / 3 : idx === 2 ? 1 / 3 + t / 3 : idx === 3 ? 2 / 3 : 2 / 3 + clamp(t / 0.6, 0, 1) / 3;
      live.style.strokeDashoffset = (1 - lp).toFixed(4);

      // C: meter
      var credit = 0.3;
      var open = false;
      if (idx === 3) { credit = 0.3 + 5 * ease(clamp(t / 0.7, 0, 1)); open = t > 0.25; }
      if (idx > 3) { credit = 5.3; open = true; }
      miniCredit.textContent = credit.toFixed(3);
      miniValve.textContent = open ? "On" : "Off";
      valveInd.style.transform = open ? "rotate(0deg)" : "rotate(90deg)";
      sms.classList.toggle("off", !(idx > 2 || (idx === 2 && t > 0.3)));

      // D: dashboard
      var dt = idx < 4 ? 0 : ease(clamp((t - 0.25) / 0.5, 0, 1));
      dashTotal.textContent = fmtKsh(12500 + 500 * dt);
      var delivered = idx === 4 && t > 0.5;
      dashPill.textContent = delivered ? "Paid" : "Pending";
      dashPill.classList.toggle("wait", !delivered);
      dashNew.classList.toggle("new", idx === 4);
    }
    render(0);
    // on phones the sticky stage covers the top of the screen, so read steps lower down
    var line = function () { return window.innerWidth < 900 ? 0.72 : 0.55; };
    scene(steps, line, line, render);
  })();

  /* ---------------------------------------------------------------
     Meter cutaway: scroll or select a feature to light the part
  --------------------------------------------------------------- */
  (function anatomy() {
    var cut = $("#cutaway");
    if (!cut) return;
    var btns = $$(".part-btn", cut);
    var parts = $$(".part", cut);
    var title = $("#cutTitle");
    var text = $("#cutText");
    var i = 0, timer = 0, touched = false;

    function setActive(btn) {
      var key = btn.getAttribute("data-part");
      btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); });
      parts.forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-part") === key); });
      cut.classList.add("has-active");
      title.textContent = btn.getAttribute("data-title");
      text.textContent = btn.getAttribute("data-text");
      i = btns.indexOf(btn);
    }
    function stop() { touched = true; clearInterval(timer); }
    setActive(btns[0]);
    btns.forEach(function (b) {
      b.addEventListener("click", function () { stop(); setActive(b); });
      if (finePointer) b.addEventListener("mouseenter", function () { stop(); setActive(b); });
    });
    // a slow guided tour while the drawing is on screen, until the visitor takes over
    if (!reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        clearInterval(timer);
        if (es[0].isIntersecting && !touched) {
          timer = setInterval(function () { setActive(btns[(i + 1) % btns.length]); }, 3200);
        }
      }, { threshold: 0.5 }).observe(cut);
    }
  })();

  /* ---------------------------------------------------------------
     Theme colours for canvas drawing
  --------------------------------------------------------------- */
  var colors = {};
  function readColors() {
    var cs = getComputedStyle(root);
    ["--paper", "--paper-2", "--ink", "--ink-2", "--line", "--aqua", "--signal", "--brass", "--card"].forEach(function (k) {
      colors[k.slice(2)] = cs.getPropertyValue(k).trim();
    });
  }
  readColors();
  try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors); } catch (e) { /* old Safari */ }
  new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------------------------------------------------------------
     Network map
  --------------------------------------------------------------- */
  var incident = false;
  (function network() {
    var canvas = $("#netCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var N = {
      src: [0.07, 0.55], tank: [0.19, 0.2], j1: [0.3, 0.55], j2: [0.52, 0.55], leak: [0.665, 0.55], j3: [0.8, 0.55],
      b1: [0.3, 0.86], b2: [0.52, 0.18], b3: [0.52, 0.86], b4: [0.8, 0.18], b5: [0.8, 0.86], b6: [0.93, 0.55]
    };
    var E = [["src", "j1", 1], ["tank", "j1", 0.6], ["j1", "j2", 1], ["j2", "leak", 1], ["leak", "j3", 1], ["j3", "b6", 0.7],
      ["j1", "b1", 0.6], ["j2", "b2", 0.6], ["j2", "b3", 0.6], ["j3", "b4", 0.6], ["j3", "b5", 0.6]];
    var downstream = { "leak-j3": 1, "j3-b6": 1, "j3-b4": 1, "j3-b5": 1 };
    var labels = { b1: "Block A", b2: "Block B", b3: "Block C", b4: "Block D", b5: "Block E", b6: "Block F" };
    var W = 0, H = 0, dpr = 1, t = 0, visible = false, last = performance.now();

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    }
    function P(k) { return [N[k][0] * W, N[k][1] * H]; }

    function drawFrame() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      var small = W < 520;
      // pipes
      E.forEach(function (e) {
        var a = P(e[0]), b = P(e[1]);
        ctx.lineCap = "round";
        ctx.strokeStyle = colors.line; ctx.lineWidth = small ? 7 : 9;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = colors.card; ctx.lineWidth = small ? 3 : 4;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      });
      // water particles
      E.forEach(function (e) {
        var a = P(e[0]), b = P(e[1]);
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        var key = e[0] + "-" + e[1];
        var slow = incident && downstream[key] ? 0.35 : 1;
        var n = Math.max(2, Math.round(len / 26));
        ctx.fillStyle = colors.aqua;
        for (var i = 0; i < n; i++) {
          var f = ((t * 0.18 * e[2] * slow * (120 / Math.max(60, len))) + i / n) % 1;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, small ? 1.8 : 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });
      // leak
      var lk = P("leak");
      if (incident) {
        for (var r = 0; r < 3; r++) {
          var ph = ((t * 0.6) + r / 3) % 1;
          ctx.strokeStyle = colors.signal;
          ctx.globalAlpha = 1 - ph;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(lk[0], lk[1], 6 + ph * 34, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.signal;
        ctx.beginPath(); ctx.arc(lk[0], lk[1], 5, 0, Math.PI * 2); ctx.fill();
      }
      // nodes
      ctx.font = "600 " + (small ? 10 : 11.5) + "px Archivo, 'Arial Narrow', sans-serif";
      if ("fontStretch" in ctx) ctx.fontStretch = "condensed";
      ctx.textBaseline = "middle";
      ["j1", "j2", "j3"].forEach(function (k) {
        var p = P(k);
        ctx.fillStyle = colors.card; ctx.strokeStyle = colors["ink-2"]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      Object.keys(labels).forEach(function (k) {
        var p = P(k), bw = small ? 46 : 62, bh = small ? 22 : 26;
        p = [clamp(p[0], bw / 2 + 4, W - bw / 2 - 4), p[1]];
        ctx.fillStyle = colors.card; ctx.strokeStyle = colors["ink-2"]; ctx.lineWidth = 1.2;
        roundRect(p[0] - bw / 2, p[1] - bh / 2, bw, bh, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colors.ink; ctx.textAlign = "center";
        ctx.fillText(labels[k].toUpperCase(), p[0], p[1] + 0.5);
      });
      // bulk meter
      var s = P("src");
      ctx.fillStyle = colors.ink; ctx.beginPath(); ctx.arc(s[0], s[1], small ? 11 : 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.aqua; ctx.beginPath(); ctx.arc(s[0], s[1], small ? 4 : 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors["ink-2"]; ctx.textAlign = "center";
      ctx.fillText("MAIN METER", s[0], s[1] + (small ? 22 : 27));
      // tank
      var tk = P("tank"), tw = small ? 30 : 38, th = small ? 34 : 42;
      ctx.fillStyle = colors.card; ctx.strokeStyle = colors["ink-2"]; ctx.lineWidth = 1.2;
      roundRect(tk[0] - tw / 2, tk[1] - th / 2, tw, th, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = colors.aqua; ctx.globalAlpha = 0.8;
      roundRect(tk[0] - tw / 2 + 3, tk[1] - th / 2 + th * 0.38, tw - 6, th * 0.62 - 3, 3); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors["ink-2"]; ctx.textAlign = "left";
      ctx.fillText("TANK 62%", tk[0] + tw / 2 + 6, tk[1]);
      // sensors
      var j2 = P("j2");
      diamond(j2[0] - 22, j2[1] - 20, 6, colors.brass);
      ctx.fillStyle = colors["ink-2"]; ctx.textAlign = "right";
      ctx.fillText("PRESSURE", j2[0] - 31, j2[1] - 20);
      diamond(lk[0], lk[1] - 24, 6, incident ? colors.signal : colors.brass);
      ctx.textAlign = "center";
      ctx.fillStyle = incident ? colors.signal : colors["ink-2"];
      ctx.fillText(incident ? "LEAK HEARD" : "LISTENING", lk[0], lk[1] - 40);
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function diamond(x, y, r, c) {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
    }
    function loop(now) {
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (visible) { t += dt; drawFrame(); }
      requestAnimationFrame(loop);
    }
    size();
    window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) drawFrame(); }).observe(canvas);
    }
    if (!reduce) requestAnimationFrame(loop);
    network.redraw = drawFrame;
    window.__smartaNetRedraw = drawFrame;
  })();

  /* ---------------------------------------------------------------
     Charts, drawn to scale from data
  --------------------------------------------------------------- */
  function chart(svg, opt) {
    var x0 = 38, x1 = 350, y0 = 14, y1 = 142;
    var sx = function (v) { return x0 + (v - opt.x[0]) / (opt.x[1] - opt.x[0]) * (x1 - x0); };
    var sy = function (v) { return y1 - (v - opt.y[0]) / (opt.y[1] - opt.y[0]) * (y1 - y0); };
    var h = '<g class="grid">';
    opt.yt.forEach(function (v) { h += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(v) + '" y2="' + sy(v) + '"/>'; });
    h += '</g><g class="axis">';
    opt.yt.forEach(function (v) { h += '<text x="' + (x0 - 6) + '" y="' + (sy(v) + 3.5) + '" text-anchor="end">' + opt.yf(v) + "</text>"; });
    opt.xt.forEach(function (v) { h += '<text x="' + sx(v) + '" y="' + (y1 + 18) + '" text-anchor="middle">' + ("0" + v).slice(-2) + ":00</text>"; });
    h += "</g>";
    opt.series.forEach(function (s) {
      var d = s.data.map(function (pt, i) { return (i ? "L" : "M") + sx(pt[0]).toFixed(1) + " " + sy(pt[1]).toFixed(1); }).join(" ");
      if (s.area) h += '<path class="area" d="' + d + " L" + sx(opt.x[1]) + " " + y1 + " L" + sx(opt.x[0]) + " " + y1 + ' Z"/>';
      h += '<path class="ln ' + (s.cls || "") + ' js-draw" pathLength="1" stroke-dasharray="1" d="' + d + '"/>';
    });
    (opt.notes || []).forEach(function (n) {
      h += '<circle class="mark-ring" cx="' + sx(n.x) + '" cy="' + sy(n.y) + '" r="7"/>';
      h += '<circle class="mark" cx="' + sx(n.x) + '" cy="' + sy(n.y) + '" r="3"/>';
      h += '<text class="note ' + (n.cls || "") + '" x="' + (sx(n.x) + (n.dx || 10)) + '" y="' + (sy(n.y) + (n.dy || -10)) + '" text-anchor="' + (n.anchor || "start") + '">' + n.text + "</text>";
    });
    svg.innerHTML = h;
    return $$(".js-draw", svg);
  }
  var noise = function (i, a, b) { return a * Math.sin(i * 1.7) + b * Math.sin(i * 0.63 + 1); };

  var pressure = [];
  for (var i = 0; i <= 72; i++) {
    var hr = i / 12;
    var base = hr < 2.25 ? 3.2 : hr < 2.42 ? 3.2 - (hr - 2.25) / 0.17 * 0.9 : 2.3;
    pressure.push([hr, base + noise(i, 0.025, 0.02)]);
  }
  var unit3 = [], median = [];
  for (var j = 0; j <= 72; j++) {
    var h2 = j / 12;
    var wake = h2 > 5.4 ? (h2 - 5.4) / 0.6 : 0;
    unit3.push([h2, 0.42 + noise(j, 0.018, 0.012) + wake * 0.38]);
    median.push([h2, Math.max(0, 0.03 + noise(j + 3, 0.012, 0.008) + wake * 0.3)]);
  }

  var drawLines = [];
  var pc = $("#pressureChart");
  if (pc) drawLines = drawLines.concat(chart(pc, {
    x: [0, 6], y: [1.5, 3.5], xt: [0, 2, 4, 6], yt: [1.5, 2, 2.5, 3, 3.5],
    yf: function (v) { return v.toFixed(1); },
    series: [{ data: pressure, area: true }],
    notes: [{ x: 2.42, y: 2.3, text: "2:15 a.m. pressure drops", dx: 12, dy: 18 }]
  }));
  var nc = $("#nightChart");
  if (nc) drawLines = drawLines.concat(chart(nc, {
    x: [0, 6], y: [0, 1], xt: [0, 2, 4, 6], yt: [0, 0.25, 0.5, 0.75, 1],
    yf: function (v) { return v.toFixed(2); },
    series: [{ data: median, cls: "base" }, { data: unit3, cls: "bad" }],
    notes: [{ x: 3, y: 0.42, text: "Never stops: about 600 litres a day", dx: 0, dy: -16, anchor: "middle" }]
  }));

  (function netScene() {
    var grid = $("#netGrid");
    var alertEl = $("#netAlert");
    var at = $("#alertTitle"), ax = $("#alertText"), ai = $("#alertIcon");
    if (!grid) return;
    function set(p) {
      var dp = reduce ? 1 : clamp(p / 0.6, 0, 1);
      drawLines.forEach(function (l) { l.style.strokeDashoffset = (1 - dp).toFixed(4); });
      var now = p > 0.3;
      if (now !== incident) {
        incident = now;
        alertEl.classList.toggle("is-leak", incident);
        at.textContent = incident ? "Possible burst pipe near Block D" : "All quiet across the site";
        ax.textContent = incident
          ? "Water pressure dropped suddenly at 2:15 a.m. and a sensor can hear the leak. You can shut off supply to Blocks D to F from your phone."
          : "Water pressure is normal and no leak sounds have been heard.";
        ai.setAttribute("d", incident ? "M12 7v6M12 16.5v.5" : "M5 12l5 5 9-10");
        if (window.__smartaNetRedraw) window.__smartaNetRedraw();
      }
    }
    set(0);
    scene(grid, 0.9, 0.7, set);
  })();

  /* tank waves */
  (function tank() {
    var w1 = $("#wave1"), w2 = $("#wave2");
    if (!w1 || reduce) return;
    var t0 = performance.now(), on = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; }).observe(w1.ownerSVGElement);
    (function f(now) {
      if (!on) { requestAnimationFrame(f); return; }
      var t = (now - t0) / 1000;
      w1.setAttribute("transform", "translate(" + (-((t * 30) % 92)).toFixed(2) + " 0)");
      w2.setAttribute("transform", "translate(" + (-((t * 18 + 40) % 92)).toFixed(2) + " 0)");
      requestAnimationFrame(f);
    })(t0);
  })();

  /* ---------------------------------------------------------------
     Audience tabs (with matching example dashboards)
  --------------------------------------------------------------- */
  (function tabs() {
    var tabs = $$('[role="tab"]');
    if (!tabs.length) return;
    function show(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!k) return;
        var n = tabs[(i + k + tabs.length) % tabs.length];
        n.focus(); show(n);
      });
    });
  })();

  /* ---------------------------------------------------------------
     Calculator
  --------------------------------------------------------------- */
  (function calc() {
    var u = $("#cUnits"), b = $("#cBill"), l = $("#cLate"), m = $("#cMonths");
    if (!u) return;
    var out = $("#outArrears"), reads = $("#outReads"), bills = $("#outBills"), year = $("#outYear");
    var shown = 12960, raf = 0;
    function fill(r) { r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
    function tween(to) {
      cancelAnimationFrame(raf);
      if (reduce) { shown = to; out.textContent = fmtKsh(to); return; }
      var from = shown, t0 = performance.now();
      (function f(now) {
        var k = clamp((now - t0) / 450, 0, 1);
        shown = from + (to - from) * ease(k);
        out.textContent = fmtKsh(shown);
        if (k < 1) raf = requestAnimationFrame(f);
      })(t0);
    }
    function update() {
      [u, b, l, m].forEach(fill);
      var units = +u.value, bill = +b.value, late = +l.value / 100, months = +m.value;
      $("#oUnits").textContent = units;
      $("#oBill").textContent = fmtKsh(bill);
      $("#oLate").textContent = Math.round(late * 100) + "%";
      $("#oMonths").textContent = months + (months === 1 ? " month" : " months");
      tween(units * bill * late * months);
      reads.textContent = (units * 12).toLocaleString("en-KE");
      bills.textContent = (units * 12).toLocaleString("en-KE");
      year.textContent = fmtKsh(units * bill * 12);
    }
    [u, b, l, m].forEach(function (r) { r.addEventListener("input", update); });
    update();
  })();

  /* ---------------------------------------------------------------
     Pilot form
  --------------------------------------------------------------- */
  (function form() {
    var f = $("#pilotForm");
    if (!f) return;
    var msg = $("#formMsg");
    function err(input, el, text) {
      input.setAttribute("aria-invalid", text ? "true" : "false");
      el.textContent = text || "";
      return !text;
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#fName"), phone = $("#fPhone"), units = $("#fUnits");
      var digits = phone.value.replace(/[\s-]/g, "");
      var ok = [
        err(name, $("#eName"), name.value.trim().length < 2 ? "Enter your name so we know who to ask for." : ""),
        err(phone, $("#ePhone"), /^(\+?254|0)?[17]\d{8}$/.test(digits) ? "" : "Enter a Kenyan mobile number, like 0712 345 678."),
        err(units, $("#eUnits"), +units.value >= 1 ? "" : "How many units does the building have?")
      ].every(Boolean);
      if (!ok) { msg.className = "form-msg"; msg.textContent = "Check the highlighted fields."; return; }

      var first = name.value.trim().split(" ")[0];
      var payload = { name: name.value.trim(), phone: digits, units: +units.value, role: $("#fRole").value };
      var endpoint = f.getAttribute("data-endpoint");
      if (!endpoint) {
        msg.className = "form-msg";
        msg.textContent = "Thanks, " + first + ". Pilot requests aren't connected yet, so nothing was sent from this page.";
        return;
      }
      msg.className = "form-msg"; msg.textContent = "Sending…";
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          msg.className = "form-msg ok";
          msg.textContent = "Thanks, " + first + ". We'll call " + phone.value.trim() + " to plan your site survey.";
          f.reset();
        })
        .catch(function () {
          msg.className = "form-msg";
          msg.textContent = "We couldn't send your request. Check your connection and try again.";
        });
    });
  })();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
