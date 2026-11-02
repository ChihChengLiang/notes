// The paw button: a borzoi is painted (once, lazily) with p5.brush, then
// lunges up from below the viewport and eats holes in the article.
// Adapted from a standalone "dog ate my homework" sketch.
(function () {
const P5_SRC = "https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js";
const BRUSH_SRC = "https://cdn.jsdelivr.net/npm/p5.brush@3.0.0/dist/p5.brush.js";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap";

/* =====================================================================
   1.  PAINT THE BORZOI WITH p5.brush  (once, into off-screen buffers)
   Local frame: dog faces LEFT, nose at x≈90, jaw hinge at (620,525).
   Three layers are painted:  teethUp < jaw < head
   ===================================================================== */
const W = 1500, H = 1100;           // local dog space
const HX = 620, HY = 545;           // jaw hinge
const MX = 300, MY = 505;           // where the bite happens (mid muzzle)

const INK   = "#1d4f43";            // same green ink as the sketch
const CREAM = "#fbf7ec";
const SHADE = "#9bb8ad";
const TAN   = "#d6ae82";
const NOSE  = "#17211d";

const O = ([x, y]) => [x - W / 2, y - H / 2];       // buffer origin is its centre

function catmull(pts, seg = 10) {                    // Catmull-Rom → dense polyline
  const n = pts.length, out = [];
  const P = i => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[n - 1]);
  return out;
}
function lineY(pts, x) {                            // y on a polyline for a given x
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    if ((x >= a[0] && x <= b[0]) || (x >= b[0] && x <= a[0])) {
      const t = (x - a[0]) / (b[0] - a[0] || 1); return a[1] + (b[1] - a[1]) * t;
    }
  }
  return pts[pts.length - 1][1];
}
function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/* ---- outlines (control points) ---- */
const topLine  = [[96,482],[84,470],[86,452],[104,438],[150,426],[260,406],[380,387],[480,368],[560,352],
                  [650,326],[760,303],[860,309],[980,358],[1120,468],[1280,640],[1420,790],[1560,940]];
const neckLow  = [[1030,1200],[940,1020],[860,860],[780,740],[710,650],[660,585],[622,545]];
const lipLine  = [[622,545],[560,540],[450,532],[300,514],[170,496],[102,484]];
const jawTop   = [[104,492],[200,505],[300,522],[450,540],[600,552],[670,556]];
const jawBot   = [[735,680],[620,662],[480,632],[350,602],[220,566],[130,530],[102,506]];

function tuft(x, y, dx, dy, len, curl) {            // one flowing hair
  const mx = x + dx * len * .5 + (-dy) * curl, my = y + dy * len * .5 + dx * curl;
  brush.spline([O([x, y]), O([mx, my]), O([x + dx * len, y + dy * len])], 0.8);
}

/* feathery fringe along an edge: jagged cream polygon + ink hairs */
function feather(pts, nrm, a, b, flow) {
  const base = catmull(pts, 5), out = base.map((p, i) => {
    const k = (i % 2 ? 1 : 0.4) * random(a, b);
    return [p[0] + nrm[0] * k + flow[0] * k * .5, p[1] + nrm[1] * k + flow[1] * k * .5];
  });
  brush.noStroke(); brush.noHatch(); brush.fill(CREAM, 255); brush.fillBleed(0.06, "out"); brush.fillTexture(0.3, 0.2);
  brush.polygon([...base, ...out.slice().reverse()].map(O));
  brush.set("2B", INK, 1.3);
  for (let i = 0; i < base.length; i += 2) {
    const p = base[i], q = out[i], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    tuft(p[0] - dx * .25, p[1] - dy * .25, dx / L, dy / L, L * 1.25, random(-6, 6));
  }
}

function paintHead(pg) {
  brush.load(pg); pg.clear();
  randomSeed(11); noiseSeed(11);

  // --- coat: watercolour wash for the whole head + neck
  const outline = [...catmull(topLine, 8), [1700, 1000], [1700, 1250], [1030, 1250],
                   ...catmull(neckLow, 8), ...catmull(lipLine, 8)];
  brush.noStroke(); brush.noHatch();
  brush.fill(CREAM, 255); brush.fillBleed(0.08, "out"); brush.fillTexture(0.35, 0.2);
  brush.polygon(outline.map(O));
  brush.fill("#e9dfc6", 120); brush.fillBleed(0.5, "in"); brush.fillTexture(0.5, 0.4);
  brush.polygon(outline.map(O));

  // --- feathery mane behind the skull and a shaggy throat ruff
  feather(topLine.slice(10, 16), [0.55, -0.83], 18, 46, [0.5, 0.35]);
  feather(neckLow.slice().reverse().slice(0, 6).reverse(), [-0.86, 0.5], 22, 52, [-0.1, 0.9]);

  // --- shading hatch: throat / neck, cheek
  brush.noFill(); brush.noStroke();
  brush.hatchStyle("HB", SHADE, 1.3);
  brush.hatch(13, 62, { rand: 0.25 });
  brush.polygon([[700,650],[780,740],[860,860],[940,1020],[1030,1200],[1300,1200],[1100,850],[900,640],[800,580]].map(O));
  brush.hatch(10, 24, { rand: 0.3 });
  brush.polygon([[470,430],[560,420],[640,424],[700,455],[690,540],[600,545],[470,532]].map(O));
  brush.noHatch();

  // --- ear (folded back "rose" ear, tan)
  const ear = catmull([[795,320],[845,293],[925,300],[1000,338],[1040,385],[975,392],[905,372],[840,356]], 8);
  brush.noStroke();
  brush.fill(TAN, 235); brush.fillBleed(0.4, "out"); brush.fillTexture(0.5, 0.4);
  brush.polygon(ear.map(O));
  brush.noFill();
  brush.hatchStyle("2B", "#8a5b36", 1.0); brush.hatch(9, 20, { rand: 0.25 });
  brush.polygon(ear.map(O)); brush.noHatch();
  brush.set("2B", INK, 1.8);
  brush.spline(catmull([[795,320],[845,293],[925,300],[1000,338],[1040,385]], 6).map(O), 0.6);
  brush.set("2B", INK, 1.4);
  brush.spline(catmull([[1040,385],[975,392],[905,372],[840,356],[800,330]], 6).map(O), 0.6);

  // --- long flowing fur on the neck
  brush.set("2B", INK, 1.0);
  const neckPoly = [...catmull(topLine, 6), [1700, 1000], [1700, 1250], [1030, 1250], ...catmull(neckLow, 6)];
  for (let i = 0; i < 120; i++) {
    const t = random(0.18, 1);
    const k = Math.floor(t * (topLine.length - 2)), f = t * (topLine.length - 2) - k;
    const a = topLine[k], b = topLine[k + 1];
    const px = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f;
    const d = random(25, 320);
    const sx = px - 0.69 * d, sy = py + 0.72 * d;
    if (!inside([sx, sy], neckPoly)) continue;
    const len = random(60, 180);
    const ex = sx + 0.72 * len, ey = sy + 0.69 * len;
    if (!inside([ex, ey], neckPoly)) continue;
    tuft(sx, sy, 0.72, 0.69, len, random(-16, 16));
  }
  // fringe of hair breaking the top contour
  brush.set("2B", INK, 1.5);
  for (let i = 0; i < 28; i++) {
    const t = random(0.22, 0.98), k = Math.floor(t * (topLine.length - 2)), f = t * (topLine.length - 2) - k;
    const a = topLine[k], b = topLine[k + 1];
    tuft(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 0.74, 0.58, random(45, 95), random(6, 20));
  }
  brush.set("HB", INK, 1.0);
  for (let i = 0; i < 16; i++) tuft(random(660, 840), random(320, 355), 0.9, 0.35, random(40, 80), random(-6, 6));

  // --- main outline in ink
  brush.set("pen", INK, 2.6);
  brush.spline(catmull(topLine.slice(0, 13), 10).map(O), 0.55);
  brush.set("2B", INK, 2.2);
  brush.spline(catmull(neckLow, 10).map(O), 0.5);
  brush.set("pen", INK, 2.2);
  brush.spline(catmull(lipLine, 10).map(O), 0.5);
  brush.set("HB", INK, 1.6);                                                     // brow / stop
  brush.spline(catmull([[560,352],[592,374],[640,374]], 8).map(O), 0.5);
  brush.set("HB", "#6f8f83", 1.8);                                               // muzzle shadow
  brush.spline(catmull([[150,442],[260,434],[380,422],[470,414]], 8).map(O), 0.5);

  // --- eye
  const eye = catmull([[606,388],[632,367],[668,365],[694,382],[664,398],[630,400]], 8);
  brush.noStroke(); brush.fill("#2b1a13", 255); brush.fillBleed(0.1); brush.fillTexture(0.1, 0.1);
  brush.polygon(eye.map(O));
  brush.set("pen", INK, 2.4);
  brush.spline(catmull([[598,394],[626,363],[668,358],[704,382]], 8).map(O), 0.6);   // upper lid
  brush.set("HB", INK, 1.6);
  brush.spline(catmull([[610,406],[650,406],[692,392]], 8).map(O), 0.6);              // lower lid
  brush.noStroke(); brush.fill("#fffdf4", 255);
  brush.circle(...O([655, 377]), 6);
  brush.set("2B", INK, 2.0);
  brush.line(...O([702, 380]), ...O([746, 366]));                                     // confident eye-liner flick

  // --- nose (black, glossy)
  const nose = catmull([[78,470],[76,440],[100,420],[134,424],[146,452],[128,482],[96,490]], 8);
  brush.noStroke(); brush.fill(NOSE, 255); brush.fillBleed(0.1); brush.fillTexture(0.1, 0.2);
  brush.polygon(nose.map(O));
  brush.fill("#050807", 255); brush.fillBleed(0); brush.polygon(nose.map(O));
  brush.set("pen", INK, 1.8);
  brush.spline(catmull([...nose.filter((_, i) => i % 8 === 0), nose[0]], 6).map(O), 0.5);
  brush.noStroke(); brush.fill("#9db5ad", 235);
  brush.circle(...O([112, 434]), 5);
  brush.set("HB", "#8fa8a0", 1.4);
  brush.spline(catmull([[100,462],[112,470],[128,462]], 6).map(O), 0.5);              // nostril

  brush.load();
}

function paintJaw(pg) {
  brush.load(pg); pg.clear();
  randomSeed(21);
  const poly = [...catmull(jawTop, 8), ...catmull(jawBot, 8)];
  brush.noStroke(); brush.noHatch();
  brush.fill(CREAM, 255); brush.fillBleed(0.08, "out"); brush.fillTexture(0.3, 0.2);
  brush.polygon(poly.map(O));
  brush.fill("#e9dfc6", 120); brush.fillBleed(0.5, "in");
  brush.polygon(poly.map(O));

  // tongue lying on the jaw
  const tongue = catmull([[240,514],[300,494],[400,490],[500,506],[570,530],[600,552],[420,548]], 8);
  brush.fill("#e9808f", 255); brush.fillBleed(0.3, "out"); brush.fillTexture(0.3, 0.3);
  brush.polygon(tongue.map(O));
  brush.set("HB", "#9c3d4c", 1.4);
  brush.spline(catmull([[290,516],[400,512],[520,526]], 8).map(O), 0.5);

  // lower gum + lower teeth (zigzag fangs pointing up)
  brush.noStroke(); brush.fill("#e99aa6", 255);
  brush.polygon(catmull([[110,497],[200,510],[300,527],[450,545],[450,552],[300,533],[200,516],[112,503]], 6).map(O));
  for (let x = 150, i = 0; x <= 480; x += 30, i++) {
    const y = lineY(jawTop, x) + 2, canine = i === 0, h = canine ? 50 : random(18, 28), b = canine ? 30 : 22;
    const tri = [[x - b / 2, y], [x + b / 2, y], [x + (canine ? 3 : 1), y - h]];
    brush.noStroke(); brush.fill("#fffdf6", 255); brush.fillBleed(0.05); brush.polygon(tri.map(O));
    brush.set("pen", INK, 1.5); brush.polygon(tri.map(O));
  }

  // outline + beard
  brush.set("pen", INK, 2.4);
  brush.spline(catmull([[104,492],[102,506],[130,530],[220,566],[350,602],[480,632],[620,662],[720,686]], 8).map(O), 0.5);
  brush.set("pen", INK, 1.8);
  brush.spline(catmull(jawTop.slice(0, 5), 8).map(O), 0.5);
  brush.set("2B", INK, 1.2);
  for (let i = 0; i < 26; i++) {
    const x = random(150, 640), y = lineY(jawBot, x);
    tuft(x, y - random(0, 24), 0.5, 0.86, random(30, 80), random(-9, 9));
  }
  brush.hatchStyle("HB", SHADE, 1.2); brush.noFill(); brush.noStroke();
  brush.hatch(11, 62, { rand: 0.25 });
  brush.polygon([[300,596],[480,628],[620,658],[720,684],[660,620],[450,584]].map(O));
  brush.noHatch();
  brush.load();
}

function paintTeethUp(pg) {
  brush.load(pg); pg.clear();
  randomSeed(31);
  const lipRev = lipLine.slice().reverse();
  brush.noStroke(); brush.noHatch(); brush.fill("#e99aa6", 255);
  const gum = [...catmull(lipRev, 8), ...catmull(lipRev.map(p => [p[0], p[1] + 10]), 8).reverse()];
  brush.polygon(gum.map(O));
  for (let x = 150, i = 0; x <= 560; x += 31, i++) {
    const y = lineY(lipRev, x) + 8, canine = i === 1, h = canine ? 58 : random(22, 32), b = canine ? 34 : 24;
    const tri = [[x - b / 2, y], [x + b / 2, y], [x - (canine ? 4 : 2), y + h]];
    brush.noStroke(); brush.fill("#fffdf6", 255); brush.fillBleed(0.05); brush.polygon(tri.map(O));
    brush.set("pen", INK, 1.5); brush.polygon(tri.map(O));
  }
  brush.load();
}

/* paint once, copy to the DOM canvases */
function copyTo(pg, id) {
  const c = document.getElementById(id), ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(pg.elt, 0, 0, c.width, c.height);
}
async function paintDog() {
  const host = document.createElement("div");           // p5's own canvas lives here, never shown
  host.style.display = "none"; document.body.appendChild(host);
  await new Promise(resolve => {
    window.setup = async function () {
      createCanvas(4, 4, WEBGL);
      pixelDensity(1);
      noLoop();
      angleMode(DEGREES);
      brush.scaleBrushes(4);
      brush.load();
      const mk = () => createGraphics(W, H, WEBGL);
      const a = mk(), b = mk(), c = mk();
      a.pixelDensity(1); b.pixelDensity(1); c.pixelDensity(1);
      const breathe = () => new Promise(r => setTimeout(r, 30));   // keep the page responsive between layers
      await breathe(); paintTeethUp(a); copyTo(a, "dog-teethUp");
      await breathe(); paintJaw(b);     copyTo(b, "dog-jaw");
      await breathe(); paintHead(c);    copyTo(c, "dog-head");
      [a, b, c].forEach(g => g.remove());
      resolve();
    };
    new p5(undefined, host);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error("failed to load " + src));
    document.head.appendChild(s);
  });
}

/* =====================================================================
   2.  THE ARTICLE, THE BITES AND THE CHOMPING
   ===================================================================== */
const btn = document.getElementById("paw-btn");
if (!btn) return;
const article = () => document.querySelector(".article-content, .index-nb");

let dog, jaw, fx, fctx, stain;
const ALPHA = 33;                           // head tilt (deg, clockwise = nose up-left)
const MAXJAW = 32;                          // jaw opening (deg)
const state = { x: 0, y: 0, slide: 1, jaw: 0, bob: 0, lunge: 0, running: false };
let bites = [];                             // {x, y, r, seed} in px, local to the article element
let crumbs = [];

const ease = {
  out:   t => 1 - Math.pow(1 - t, 3),
  in:    t => t * t * t,
  io:    t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back:  t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)
};
const wait = ms => new Promise(r => setTimeout(r, ms));
function tween(ms, fn, e = ease.io) {
  return new Promise(res => {
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      fn(e(t), t);
      t < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  });
}

/* the bite area: a page-shaped box centred in the viewport */
function box() {
  const w = Math.min(innerWidth * 0.9, 640), h = Math.min(w * 1.3, innerHeight * 0.9);
  return { w, h, l: (innerWidth - w) / 2, t: (innerHeight - h) / 2 };
}
const dogScale = () => Math.max(0.5, Math.min(1, innerWidth / 1100));

function buildDom() {
  dog = document.createElement("div"); dog.id = "dog";
  dog.innerHTML = ["teethUp", "jaw", "head"].map(n => `<canvas id="dog-${n}" width="${W}" height="${H}"></canvas>`).join("");
  fx = document.createElement("canvas"); fx.id = "dog-fx";
  stain = document.createElement("canvas"); stain.id = "dog-stain";
  document.body.append(dog, fx, stain);
  jaw = document.getElementById("dog-jaw");
  fctx = fx.getContext("2d");
}

/* place the dog so that the mouth point sits on (state.x, state.y) */
function applyDog() {
  const s = dogScale();
  const rad = ALPHA * Math.PI / 180;
  const u = [Math.cos(rad + 0.5), Math.sin(rad + 0.5)];            // neck direction on screen
  const D = Math.max(innerHeight, innerWidth) * 1.25 * state.slide;
  const lx = -Math.cos(rad) * state.lunge, ly = -Math.sin(rad) * state.lunge;   // forward lunge
  const x = state.x + u[0] * D + lx, y = state.y + u[1] * D + ly + state.bob;
  dog.style.transform = `translate(${x}px,${y}px) rotate(${ALPHA}deg) scale(${s}) translate(${-MX}px,${-MY}px)`;
  jaw.style.transform = `rotate(${-state.jaw}deg)`;
}

/* ---------- ragged bite holes cut out of the article with a mask ---------- */
function blobPath(ctx, cx, cy, r, seed) {
  const n = 70;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2;
    const tooth = (i % 2 ? 1 : -1) * 0.035;                         // scalloped tooth marks
    const rr = r * (1 + 0.1 * Math.sin(a * 3 + seed) + 0.06 * Math.sin(a * 7 + seed * 2) + tooth +
                    0.03 * Math.sin(a * 17 + seed * 5));
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function rebuildMask() {
  const el = article();
  if (!bites.length) {
    el.style.webkitMaskImage = el.style.maskImage = "";
    el.style.webkitMaskSize = el.style.maskSize = "";
    stain.style.display = "none";
    return;
  }
  const w = el.offsetWidth, h = el.offsetHeight;
  const k = Math.min(2, 8192 / w, 8192 / h);                        // keep tall articles under canvas limits
  const m = document.createElement("canvas"); m.width = w * k; m.height = h * k;
  const g = m.getContext("2d"); g.scale(k, k);
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = "destination-out";
  bites.forEach(b => { blobPath(g, b.x, b.y, b.r, b.seed); g.fill(); });
  const url = `url(${m.toDataURL()})`;
  el.style.webkitMaskImage = el.style.maskImage = url;
  el.style.webkitMaskSize = el.style.maskSize = "100% 100%";
  el.style.webkitMaskRepeat = el.style.maskRepeat = "no-repeat";

  // damp, chewed rim around every hole (absolutely placed over the article)
  const r = el.getBoundingClientRect();
  Object.assign(stain.style, {
    display: "block", left: r.left + scrollX + "px", top: r.top + scrollY + "px", width: w + "px", height: h + "px"
  });
  stain.width = w * k; stain.height = h * k;
  const s = stain.getContext("2d"); s.clearRect(0, 0, stain.width, stain.height); s.scale(k, k);
  // stroke every bite, then erase the inside of all of them: only the outer rim of the merged hole stays
  s.filter = "blur(7px)"; s.strokeStyle = "rgba(120,85,45,.38)"; s.lineWidth = 26;
  bites.forEach(b => { blobPath(s, b.x, b.y, b.r, b.seed); s.stroke(); });
  s.filter = "blur(1.5px)"; s.strokeStyle = "rgba(90,60,30,.35)"; s.lineWidth = 5;
  bites.forEach(b => { blobPath(s, b.x, b.y, b.r * 0.99, b.seed); s.stroke(); });
  s.filter = "none"; s.globalCompositeOperation = "destination-out";
  bites.forEach(b => { blobPath(s, b.x, b.y, b.r, b.seed); s.fill(); });
}

/* ---------- crumbs + CHOMP text ---------- */
function resizeFx() { fx.width = innerWidth; fx.height = innerHeight; }
function spawnCrumbs(x, y, n = 26) {
  const dark = document.documentElement.classList.contains("dark");
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 7;
    crumbs.push({
      x, y, vx: Math.cos(a) * v - 1, vy: Math.sin(a) * v - 5, r: 3 + Math.random() * 7,
      rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1,
      col: dark ? "#bdb6a4" : (Math.random() < .2 ? "#c9b48a" : "#fbf8ee")
    });
  }
}
function fxLoop() {
  if (state.running) applyDog();
  fctx.clearRect(0, 0, fx.width, fx.height);
  crumbs = crumbs.filter(c => c.life > 0 && c.y < fx.height + 40);
  crumbs.forEach(c => {
    c.vy += .45; c.x += c.vx; c.y += c.vy; c.vx *= .985; c.rot += c.vr; c.life -= .006;
    fctx.save(); fctx.translate(c.x, c.y); fctx.rotate(c.rot); fctx.globalAlpha = Math.max(0, c.life);
    fctx.fillStyle = c.col; fctx.strokeStyle = "rgba(0,0,0,.25)"; fctx.lineWidth = 1;
    fctx.beginPath(); fctx.moveTo(-c.r, -c.r * .6); fctx.lineTo(c.r, -c.r * .3); fctx.lineTo(c.r * .5, c.r); fctx.lineTo(-c.r * .8, c.r * .5);
    fctx.closePath(); fctx.fill(); fctx.stroke(); fctx.restore();
  });
  requestAnimationFrame(fxLoop);
}
function chompText(x, y, txt, cls = "") {
  const el = document.createElement("div"); el.className = "chomp " + cls; el.textContent = txt;
  el.style.left = x + "px"; el.style.top = y + "px"; document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

/* ---------- the performance ---------- */
const BITES = [   // [x, y, radius] as fractions of the bite box
  { x: .62, y: .78, r: .27, word: "CHOMP!" },
  { x: .84, y: .50, r: .27, word: "NOM!" },
  { x: .40, y: .96, r: .27, word: "CRUNCH!" },
  { x: .86, y: .88, r: .25, word: "GULP!" },
];

function boxToScreen(fx_, fy_) {
  const b = box();
  return [b.l + b.w * fx_, b.t + b.h * fy_];
}

async function chomp(b, i) {
  // 1. move to the bite spot with the jaws open
  const [tx, ty] = boxToScreen(b.x - 0.04, b.y - 0.1);
  const sx = state.x, sy = state.y, sj = state.jaw;
  await tween(i === 0 ? 1 : 450, e => {
    state.x = sx + (tx - sx) * e; state.y = sy + (ty - sy) * e; state.jaw = sj + (MAXJAW - sj) * e;
  }, i === 0 ? t => t : ease.io);
  await wait(140);
  // 2. SNAP shut with a lunge
  await tween(130, e => { state.jaw = MAXJAW * (1 - e); state.lunge = 55 * e; }, ease.in);
  const r = article().getBoundingClientRect(), [bx, by] = boxToScreen(b.x, b.y);
  bites.push({ x: bx - r.left, y: by - r.top, r: b.r * box().w, seed: Math.random() * 10 });
  rebuildMask();
  spawnCrumbs(tx, ty + 10, 30);
  chompText(tx - 30, ty - 60, b.word);
  // 3. chew, chew, chew
  const chews = i === BITES.length - 1 ? 6 : 4;
  await tween(chews * 190, (e, t) => {
    state.lunge = 55 * (1 - Math.min(1, t * 4));
    state.jaw = 9 * (0.5 - 0.5 * Math.cos(t * chews * Math.PI * 2));
    state.bob = Math.sin(t * chews * Math.PI * 2) * 7;
  }, t => t);
  state.jaw = 0; state.bob = 0; state.lunge = 0;
  if (i < BITES.length - 1) {                                // open wide again for the next bite
    const j0 = state.jaw; await tween(160, e => { state.jaw = j0 + (MAXJAW - j0) * e; });
  }
}

/* nose-first investigation: shuffle across the page, twitching, before the first bite */
async function sniff() {
  const spots = [[.36, .50], [.52, .64], [.60, .70]];
  const j0 = state.jaw;
  await tween(260, e => { state.jaw = j0 * (1 - e) + 2 * e; });          // close the mouth, nose to the paper
  for (const [fx_, fy_] of spots) {
    const [tx, ty] = boxToScreen(fx_, fy_), sx = state.x, sy = state.y;
    await tween(420, e => { state.x = sx + (tx - sx) * e; state.y = sy + (ty - sy) * e; });
    chompText(tx - 10, ty - 50, "sniff sniff", "small");
    await tween(520, (e, t) => {                                          // quick twitchy snuffles
      const k = Math.abs(Math.sin(t * Math.PI * 4));
      state.lunge = 16 * k; state.bob = -3 * k; state.jaw = 2 + 3 * k;
    }, t => t);
    state.lunge = 0; state.bob = 0;
  }
  await wait(250);                                                       // freeze… then pounce
}

async function run() {
  state.running = true; btn.disabled = true;
  bites = []; rebuildMask();
  const [x0, y0] = boxToScreen(.55, .62);
  state.x = x0; state.y = y0; state.slide = 1.0; state.jaw = MAXJAW * .8;
  dog.style.display = "block"; applyDog();
  await tween(900, e => { state.slide = 1 - e; state.jaw = MAXJAW * (0.8 + 0.2 * e); }, ease.back);   // rise from below
  await sniff();
  for (let i = 0; i < BITES.length; i++) await chomp(BITES[i], i);
  await wait(220);
  state.jaw = 14; chompText(state.x + 20, state.y - 80, "*burp*");           // a satisfied little burp, then retreat
  await wait(480);
  await tween(900, e => { state.slide = e; state.jaw = 14 * (1 - e); }, ease.in);
  dog.style.display = "none";
  state.running = false; btn.disabled = false;
  btn.dataset.done = "1"; btn.title = "Restore the page";
}
function restore() {
  bites = []; rebuildMask(); crumbs = [];
  btn.dataset.done = ""; btn.title = "Let the dog out";
}

let ready = null;
function init() {
  if (!ready) {
    btn.setAttribute("aria-busy", "true");
    const font = document.createElement("link");
    font.rel = "stylesheet"; font.href = FONT_HREF; document.head.appendChild(font);
    ready = loadScript(P5_SRC).then(() => loadScript(BRUSH_SRC)).then(() => {
      buildDom();
      return paintDog();
    }).then(() => {
      resizeFx(); fxLoop();
      addEventListener("resize", () => { resizeFx(); rebuildMask(); applyDog(); });
    });
    ready.catch(() => { ready = null; }).finally(() => btn.removeAttribute("aria-busy"));
  }
  return ready;
}

btn.addEventListener("pointerenter", () => init().catch(() => {}), { once: true });
btn.addEventListener("focus", () => init().catch(() => {}), { once: true });
btn.addEventListener("click", async () => {
  if (state.running) return;
  if (btn.dataset.done) return restore();
  try { await init(); } catch (e) { console.warn("The dog could not be loaded:", e); return; }
  if (!state.running) run();
});
})();
