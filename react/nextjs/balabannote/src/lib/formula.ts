import katex from "katex";

export type FormulaItem = {
  id: string;
  label: string;
  latex: string;
};

export type FormulaCategory = {
  id: string;
  title: string;
  items: FormulaItem[];
};

export function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
      output: "html",
    });
  } catch {
    return `<span class="bn-formula-error">${escapeHtml(latex)}</span>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Geniş seçilebilir formül kataloğu */
export const FORMULA_CATALOG: FormulaCategory[] = [
  {
    id: "algebra",
    title: "Cebir",
    items: [
      { id: "frac", label: "Kesir", latex: "\\dfrac{a}{b}" },
      { id: "sqrt", label: "Karekök", latex: "\\sqrt{a}" },
      { id: "cbrt", label: "Küpkök", latex: "\\sqrt[3]{a}" },
      { id: "pow", label: "Üs", latex: "a^{n}" },
      { id: "abs", label: "Mutlak değer", latex: "|x|" },
      { id: "quad", label: "İkinci dereceden", latex: "x = \\dfrac{-b \\pm \\sqrt{b^{2}-4ac}}{2a}" },
      { id: "binom", label: "Binom", latex: "(a+b)^{n} = \\sum_{k=0}^{n}\\binom{n}{k}a^{n-k}b^{k}" },
      { id: "log", label: "Logaritma", latex: "\\log_{b} a = \\dfrac{\\ln a}{\\ln b}" },
      { id: "exp", label: "Üstel", latex: "e^{x} = \\sum_{n=0}^{\\infty}\\dfrac{x^{n}}{n!}" },
      { id: "fact", label: "Faktöriyel", latex: "n! = 1\\cdot 2\\cdot\\ldots\\cdot n" },
      { id: "prop", label: "Oran", latex: "\\dfrac{a}{b} = \\dfrac{c}{d}" },
      { id: "pct", label: "Yüzde", latex: "\\dfrac{x}{100}\\cdot y" },
    ],
  },
  {
    id: "eq",
    title: "Denklem / eşitsizlik",
    items: [
      { id: "lin", label: "Doğrusal", latex: "ax + b = 0" },
      { id: "sys2", label: "2 bilinmeyenli", latex: "\\begin{cases} a_1x+b_1y=c_1 \\\\ a_2x+b_2y=c_2 \\end{cases}" },
      { id: "ineq", label: "Eşitsizlik", latex: "a < b \\le c" },
      { id: "absineq", label: "Mutlak eşitsizlik", latex: "|x-a| < \\varepsilon" },
      { id: "complete", label: "Kareye tamamlama", latex: "x^{2}+bx = \\left(x+\\dfrac{b}{2}\\right)^{2}-\\left(\\dfrac{b}{2}\\right)^{2}" },
    ],
  },
  {
    id: "trig",
    title: "Trigonometri",
    items: [
      { id: "sin", label: "sin", latex: "\\sin\\theta" },
      { id: "cos", label: "cos", latex: "\\cos\\theta" },
      { id: "tan", label: "tan", latex: "\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}" },
      { id: "pyth", label: "Pisagor kimliği", latex: "\\sin^{2}\\theta + \\cos^{2}\\theta = 1" },
      { id: "lawsin", label: "Sinüs teoremi", latex: "\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}" },
      { id: "lawcos", label: "Kosinüs teoremi", latex: "c^{2} = a^{2}+b^{2}-2ab\\cos C" },
      { id: "dangle", label: "İki açı sin", latex: "\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta" },
      { id: "danglec", label: "İki açı cos", latex: "\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta" },
      { id: "deg", label: "Radyan", latex: "\\pi\\ \\text{rad} = 180^{\\circ}" },
    ],
  },
  {
    id: "calc",
    title: "Kalkülüs",
    items: [
      { id: "lim", label: "Limit", latex: "\\lim_{x \\to a} f(x)" },
      { id: "lim0", label: "sinc limiti", latex: "\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1" },
      { id: "der", label: "Türev", latex: "f'(x) = \\lim_{h \\to 0}\\dfrac{f(x+h)-f(x)}{h}" },
      { id: "powder", label: "Üs türevi", latex: "\\dfrac{d}{dx}x^{n} = nx^{n-1}" },
      { id: "chain", label: "Zincir kuralı", latex: "(f\\circ g)' = (f'\\circ g)\\cdot g'" },
      { id: "prod", label: "Çarpım kuralı", latex: "(uv)' = u'v + uv'" },
      { id: "quot", label: "Bölüm kuralı", latex: "\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v-uv'}{v^{2}}" },
      { id: "int", label: "Belirli integral", latex: "\\int_{a}^{b} f(x)\\,dx" },
      { id: "intdef", label: "Belirsiz integral", latex: "\\int f(x)\\,dx = F(x)+C" },
      { id: "ftc", label: "Temel teorem", latex: "\\int_{a}^{b} f'(x)\\,dx = f(b)-f(a)" },
      { id: "part", label: "Kısmi integral", latex: "\\int u\\,dv = uv - \\int v\\,du" },
      { id: "dbl", label: "Çift integral", latex: "\\iint_{D} f(x,y)\\,dA" },
      { id: "series", label: "Taylor", latex: "f(x)=\\sum_{n=0}^{\\infty}\\dfrac{f^{(n)}(a)}{n!}(x-a)^{n}" },
    ],
  },
  {
    id: "linalg",
    title: "Doğrusal cebir",
    items: [
      { id: "mat2", label: "2×2 matris", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { id: "mat3", label: "3×3 matris", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
      { id: "det2", label: "2×2 determinant", latex: "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc" },
      { id: "inv2", label: "2×2 ters", latex: "A^{-1}=\\dfrac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}" },
      { id: "dot", label: "Nokta çarpım", latex: "\\vec{u}\\cdot\\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta" },
      { id: "cross", label: "Çarpraz çarpım", latex: "\\vec{u}\\times\\vec{v}" },
      { id: "eig", label: "Özdeğer", latex: "A\\vec{v} = \\lambda\\vec{v}" },
      { id: "norm", label: "Norm", latex: "\\|\\vec{v}\\| = \\sqrt{v_1^{2}+\\cdots+v_n^{2}}" },
    ],
  },
  {
    id: "stat",
    title: "İstatistik / olasılık",
    items: [
      { id: "mean", label: "Ortalama", latex: "\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^{n} x_i" },
      { id: "var", label: "Varyans", latex: "s^{2} = \\dfrac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^{2}" },
      { id: "std", label: "Standart sapma", latex: "s = \\sqrt{s^{2}}" },
      { id: "comb", label: "Kombinasyon", latex: "\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}" },
      { id: "perm", label: "Permütasyon", latex: "P(n,k)=\\dfrac{n!}{(n-k)!}" },
      { id: "bayes", label: "Bayes", latex: "P(A|B)=\\dfrac{P(B|A)P(A)}{P(B)}" },
      { id: "normd", label: "Normal dağılım", latex: "f(x)=\\dfrac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^{2}}{2\\sigma^{2}}}" },
      { id: "expect", label: "Beklenen değer", latex: "E[X]=\\sum x\\,P(X=x)" },
    ],
  },
  {
    id: "geo",
    title: "Geometri",
    items: [
      { id: "circle", label: "Daire alanı", latex: "A = \\pi r^{2}" },
      { id: "circ", label: "Çevre", latex: "C = 2\\pi r" },
      { id: "sphere", label: "Küre hacmi", latex: "V = \\dfrac{4}{3}\\pi r^{3}" },
      { id: "sphera", label: "Küre alanı", latex: "A = 4\\pi r^{2}" },
      { id: "tri", label: "Üçgen alanı", latex: "A = \\dfrac{1}{2}bh" },
      { id: "heron", label: "Heron", latex: "A=\\sqrt{s(s-a)(s-b)(s-c)}" },
      { id: "dist", label: "2N uzaklık", latex: "d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}" },
      { id: "mid", label: "Orta nokta", latex: "M=\\left(\\dfrac{x_1+x_2}{2},\\dfrac{y_1+y_2}{2}\\right)" },
      { id: "slope", label: "Eğim", latex: "m=\\dfrac{y_2-y_1}{x_2-x_1}" },
      { id: "lineeq", label: "Doğru denklemi", latex: "y-y_1=m(x-x_1)" },
    ],
  },
  {
    id: "phys",
    title: "Fizik",
    items: [
      { id: "emc2", label: "E = mc²", latex: "E = mc^{2}" },
      { id: "newt", label: "Newton 2.", latex: "F = ma" },
      { id: "grav", label: "Yerçekimi", latex: "F = G\\dfrac{m_1 m_2}{r^{2}}" },
      { id: "kin", label: "Kinetik enerji", latex: "K = \\dfrac{1}{2}mv^{2}" },
      { id: "pot", label: "Potansiyel enerji", latex: "U = mgh" },
      { id: "ohm", label: "Ohm", latex: "V = IR" },
      { id: "coul", label: "Coulomb", latex: "F = k\\dfrac{q_1 q_2}{r^{2}}" },
      { id: "wave", label: "Dalga", latex: "v = f\\lambda" },
      { id: "photo", label: "Fotoelektrik", latex: "E = hf" },
      { id: "ideal", label: "İdeal gaz", latex: "PV = nRT" },
      { id: "mom", label: "Momentum", latex: "p = mv" },
      { id: "work", label: "İş", latex: "W = Fd\\cos\\theta" },
    ],
  },
  {
    id: "chem",
    title: "Kimya",
    items: [
      { id: "mol", label: "Mol", latex: "n = \\dfrac{m}{M}" },
      { id: "conc", label: "Molarite", latex: "M = \\dfrac{n}{V}" },
      { id: "ph", label: "pH", latex: "\\mathrm{pH} = -\\log_{10}[\\mathrm{H}^{+}]" },
      { id: "keq", label: "Denge sabiti", latex: "K = \\dfrac{[C]^{c}[D]^{d}}{[A]^{a}[B]^{b}}" },
      { id: "arr", label: "Arrhenius", latex: "k = Ae^{-E_a/RT}" },
    ],
  },
  {
    id: "sets",
    title: "Kümeler / mantık",
    items: [
      { id: "union", label: "Birleşim", latex: "A \\cup B" },
      { id: "inter", label: "Kesişim", latex: "A \\cap B" },
      { id: "subset", label: "Alt küme", latex: "A \\subseteq B" },
      { id: "empty", label: "Boş küme", latex: "\\emptyset" },
      { id: "forall", label: "Her", latex: "\\forall x\\in X" },
      { id: "exists", label: "Vardır", latex: "\\exists x\\in X" },
      { id: "impl", label: "Gerektirme", latex: "P \\Rightarrow Q" },
      { id: "iff", label: "Ancak ve ancak", latex: "P \\iff Q" },
    ],
  },
  {
    id: "fin",
    title: "Finans",
    items: [
      { id: "simple", label: "Basit faiz", latex: "I = Prt" },
      { id: "comp", label: "Bileşik faiz", latex: "A = P\\left(1+\\dfrac{r}{n}\\right)^{nt}" },
      { id: "pv", label: "Bugünkü değer", latex: "PV = \\dfrac{FV}{(1+r)^{n}}" },
      { id: "ann", label: "Anüite", latex: "PMT = PV\\dfrac{r(1+r)^{n}}{(1+r)^{n}-1}" },
    ],
  },
];

export const ALL_FORMULAS: FormulaItem[] = FORMULA_CATALOG.flatMap((c) => c.items);
