import { useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Category = "hair" | "top" | "bottom" | "shoes" | "accessory";

type Outfit = {
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
  accessory: string;
  background: string;
  colors: {
    hair: string;
    top: string;
    bottom: string;
    shoes: string;
    accessory: string;
  };
};

type ClosetState = {
  past: Outfit[];
  present: Outfit;
  future: Outfit[];
};

type ClosetAction =
  | { type: "update"; payload: Partial<Outfit> }
  | { type: "updateColor"; category: Category; color: string }
  | { type: "load"; payload: Outfit }
  | { type: "random"; payload: Outfit }
  | { type: "reset"; payload: Outfit }
  | { type: "undo" }
  | { type: "redo" };

const categoryLabels: { key: Category; label: string }[] = [
  { key: "hair", label: "Sac" },
  { key: "top", label: "Ust" },
  { key: "bottom", label: "Alt" },
  { key: "shoes", label: "Ayakkabi" },
  { key: "accessory", label: "Aksesuar" },
];

const options = {
  hair: [
    { id: "long", label: "Uzun" },
    { id: "bob", label: "Kisa" },
    { id: "ponytail", label: "At Kuyrugu" },
    { id: "bun", label: "Topuz" },
  ],
  top: [
    { id: "jacket", label: "Ceket" },
    { id: "hoodie", label: "Hoodie" },
    { id: "blouse", label: "Bluz" },
    { id: "dressTop", label: "Elbise Ustu" },
  ],
  bottom: [
    { id: "jeans", label: "Jean" },
    { id: "skirt", label: "Etek" },
    { id: "shorts", label: "Sort" },
    { id: "dressBottom", label: "Elbise Alti" },
  ],
  shoes: [
    { id: "heels", label: "Topuklu" },
    { id: "boots", label: "Bot" },
    { id: "sneakers", label: "Spor" },
    { id: "flats", label: "Babet" },
  ],
  accessory: [
    { id: "none", label: "Yok" },
    { id: "glasses", label: "Gozluk" },
    { id: "necklace", label: "Kolye" },
    { id: "bag", label: "Canta" },
  ],
  background: [
    { id: "studio", label: "Studyo", className: "from-fuchsia-500 via-purple-600 to-indigo-700" },
    { id: "sunset", label: "Gunes", className: "from-rose-500 via-orange-400 to-amber-300" },
    { id: "city", label: "Sehir", className: "from-slate-700 via-slate-800 to-zinc-950" },
    { id: "mint", label: "Mint", className: "from-emerald-400 via-cyan-400 to-sky-600" },
  ],
};

const baseOutfit: Outfit = {
  hair: "long",
  top: "jacket",
  bottom: "jeans",
  shoes: "heels",
  accessory: "none",
  background: "studio",
  colors: {
    hair: "#3f2b1b",
    top: "#ef476f",
    bottom: "#4f46e5",
    shoes: "#1f2937",
    accessory: "#facc15",
  },
};

const pickRandom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const makeRandomOutfit = (): Outfit => ({
  hair: pickRandom(options.hair).id,
  top: pickRandom(options.top).id,
  bottom: pickRandom(options.bottom).id,
  shoes: pickRandom(options.shoes).id,
  accessory: pickRandom(options.accessory).id,
  background: pickRandom(options.background).id,
  colors: {
    hair: baseOutfit.colors.hair,
    top: baseOutfit.colors.top,
    bottom: baseOutfit.colors.bottom,
    shoes: baseOutfit.colors.shoes,
    accessory: baseOutfit.colors.accessory,
  },
});

const withHistory = (state: ClosetState, next: Outfit): ClosetState => ({
  past: [...state.past, state.present],
  present: next,
  future: [],
});

const closetReducer = (state: ClosetState, action: ClosetAction): ClosetState => {
  switch (action.type) {
    case "update":
      return withHistory(state, { ...state.present, ...action.payload });
    case "updateColor":
      return withHistory(state, {
        ...state.present,
        colors: {
          ...state.present.colors,
          [action.category]: action.color,
        },
      });
    case "load":
    case "random":
    case "reset":
      return withHistory(state, action.payload);
    case "undo": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
};

type Challenge = {
  title: string;
  target: Pick<Outfit, "hair" | "top" | "bottom" | "shoes" | "accessory">;
};

const buildChallenge = (): Challenge => {
  const names = ["Kafe Stili", "Sokak Modasi", "Aksam Kombini", "Festival Gunu", "Sehir Sikligi"];
  return {
    title: pickRandom(names),
    target: {
      hair: pickRandom(options.hair).id,
      top: pickRandom(options.top).id,
      bottom: pickRandom(options.bottom).id,
      shoes: pickRandom(options.shoes).id,
      accessory: pickRandom(options.accessory).id,
    },
  };
};

const getLabel = (items: { id: string; label: string }[], id: string) =>
  items.find((item) => item.id === id)?.label ?? id;

function HairLayer({ style, color }: { style: string; color: string }) {
  if (style === "long") return <div className="absolute left-1/2 top-7 h-34 w-30 -translate-x-1/2 rounded-[48%]" style={{ backgroundColor: color }} />;
  if (style === "bob") return <div className="absolute left-1/2 top-10 h-24 w-30 -translate-x-1/2 rounded-[45%]" style={{ backgroundColor: color }} />;
  if (style === "ponytail") {
    return (
      <>
        <div className="absolute left-1/2 top-8 h-18 w-28 -translate-x-1/2 rounded-[46%]" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-18 h-28 w-9 translate-x-10 rounded-b-full" style={{ backgroundColor: color }} />
      </>
    );
  }
  return (
    <>
      <div className="absolute left-1/2 top-10 h-20 w-28 -translate-x-1/2 rounded-[48%]" style={{ backgroundColor: color }} />
      <div className="absolute left-1/2 top-4 h-12 w-12 -translate-x-1/2 rounded-full" style={{ backgroundColor: color }} />
    </>
  );
}

function TopLayer({ style, color }: { style: string; color: string }) {
  if (style === "hoodie") {
    return (
      <>
        <div className="absolute left-1/2 top-44 h-26 w-34 -translate-x-1/2 rounded-[30px]" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-39 h-12 w-18 -translate-x-1/2 rounded-full border-4 border-slate-200/30" style={{ backgroundColor: color }} />
      </>
    );
  }
  if (style === "blouse") return <div className="absolute left-1/2 top-45 h-24 w-34 -translate-x-1/2 rounded-[18px]" style={{ backgroundColor: color }} />;
  if (style === "dressTop") return <div className="absolute left-1/2 top-43 h-34 w-32 -translate-x-1/2 rounded-t-[28px]" style={{ backgroundColor: color }} />;
  return <div className="absolute left-1/2 top-44 h-25 w-36 -translate-x-1/2 rounded-[16px]" style={{ backgroundColor: color }} />;
}

function BottomLayer({ style, color }: { style: string; color: string }) {
  if (style === "skirt") {
    return (
      <div
        className="absolute left-1/2 top-66 h-20 w-38 -translate-x-1/2"
        style={{
          backgroundColor: color,
          clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
        }}
      />
    );
  }
  if (style === "shorts") return <div className="absolute left-1/2 top-66 h-14 w-32 -translate-x-1/2 rounded-[12px]" style={{ backgroundColor: color }} />;
  if (style === "dressBottom") return <div className="absolute left-1/2 top-70 h-24 w-44 -translate-x-1/2 rounded-b-[42px]" style={{ backgroundColor: color }} />;
  return (
    <>
      <div className="absolute left-1/2 top-66 h-30 w-14 -translate-x-[110%] rounded-b-[18px]" style={{ backgroundColor: color }} />
      <div className="absolute left-1/2 top-66 h-30 w-14 translate-x-[10%] rounded-b-[18px]" style={{ backgroundColor: color }} />
    </>
  );
}

function ShoesLayer({ style, color }: { style: string; color: string }) {
  if (style === "heels") {
    return (
      <>
        <div className="absolute left-1/2 top-[28.5rem] h-8 w-12 -translate-x-[125%] rounded-b-2xl rounded-t-sm" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-[28.5rem] h-8 w-12 translate-x-[20%] rounded-b-2xl rounded-t-sm" style={{ backgroundColor: color }} />
      </>
    );
  }
  if (style === "boots") {
    return (
      <>
        <div className="absolute left-1/2 top-[27.8rem] h-12 w-12 -translate-x-[125%] rounded-lg" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-[27.8rem] h-12 w-12 translate-x-[20%] rounded-lg" style={{ backgroundColor: color }} />
      </>
    );
  }
  if (style === "sneakers") {
    return (
      <>
        <div className="absolute left-1/2 top-[28.7rem] h-7 w-14 -translate-x-[135%] rounded-2xl" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-[28.7rem] h-7 w-14 translate-x-[30%] rounded-2xl" style={{ backgroundColor: color }} />
      </>
    );
  }
  return (
    <>
      <div className="absolute left-1/2 top-[28.9rem] h-6 w-12 -translate-x-[128%] rounded-2xl" style={{ backgroundColor: color }} />
      <div className="absolute left-1/2 top-[28.9rem] h-6 w-12 translate-x-[24%] rounded-2xl" style={{ backgroundColor: color }} />
    </>
  );
}

function AccessoryLayer({ style, color }: { style: string; color: string }) {
  if (style === "glasses") {
    return (
      <>
        <div className="absolute left-1/2 top-19 h-6 w-8 -translate-x-[145%] rounded-md border-2 border-slate-900/80" />
        <div className="absolute left-1/2 top-19 h-6 w-8 translate-x-[45%] rounded-md border-2 border-slate-900/80" />
        <div className="absolute left-1/2 top-21 h-1 w-4 -translate-x-1/2 bg-slate-900/80" />
      </>
    );
  }
  if (style === "necklace") return <div className="absolute left-1/2 top-39 h-8 w-16 -translate-x-1/2 rounded-full border-4" style={{ borderColor: color }} />;
  if (style === "bag") {
    return (
      <>
        <div className="absolute left-1/2 top-66 h-18 w-16 translate-x-[95%] rounded-xl" style={{ backgroundColor: color }} />
        <div className="absolute left-1/2 top-60 h-12 w-12 translate-x-[110%] rounded-full border-4" style={{ borderColor: color }} />
      </>
    );
  }
  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(closetReducer, {
    past: [],
    present: baseOutfit,
    future: [],
  });
  const [activeCategory, setActiveCategory] = useState<Category>("hair");
  const [savedLooks, setSavedLooks] = useState<Outfit[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const outfit = state.present;

  useEffect(() => {
    const raw = localStorage.getItem("style-studio-lookbook");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Outfit[];
      setSavedLooks(parsed);
    } catch {
      setSavedLooks([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("style-studio-lookbook", JSON.stringify(savedLooks));
  }, [savedLooks]);

  const challengeScore = useMemo(() => {
    if (!challenge) return 0;
    const keys: Category[] = ["hair", "top", "bottom", "shoes", "accessory"];
    const hit = keys.filter((key) => outfit[key] === challenge.target[key]).length;
    return Math.round((hit / keys.length) * 100);
  }, [challenge, outfit]);

  const backgroundClass = options.background.find((item) => item.id === outfit.background)?.className;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Style Studio: Gelismis Giydirme Oyunu</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300 md:text-base">
            Sac, kiyafet, ayakkabi, aksesuar ve arka plani tek tek kontrol et. Rastgele stil olustur, gorev modunda hedef kombinle esles ve kendi lookbook koleksiyonunu kaydet.
          </p>

          <div className={`mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-br ${backgroundClass} p-6 shadow-2xl shadow-black/50`}>
            <motion.div
              className="absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/20 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex min-h-[34rem] items-center justify-center">
              <motion.div
                className="relative h-[32rem] w-72"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <HairLayer style={outfit.hair} color={outfit.colors.hair} />

                <div className="absolute left-1/2 top-12 h-24 w-24 -translate-x-1/2 rounded-full bg-[#f3c7a5]" />
                <div className="absolute left-1/2 top-26 h-6 w-10 -translate-x-1/2 rounded-xl bg-[#efbb95]" />
                <div className="absolute left-1/2 top-31 h-42 w-26 -translate-x-1/2 rounded-[40px] bg-[#f4ccab]" />
                <div className="absolute left-1/2 top-37 h-28 w-8 -translate-x-[170%] rounded-full bg-[#f4ccab]" />
                <div className="absolute left-1/2 top-37 h-28 w-8 translate-x-[70%] rounded-full bg-[#f4ccab]" />
                <div className="absolute left-1/2 top-[18.3rem] h-40 w-10 -translate-x-[140%] rounded-full bg-[#f3c7a5]" />
                <div className="absolute left-1/2 top-[18.3rem] h-40 w-10 translate-x-[40%] rounded-full bg-[#f3c7a5]" />

                <TopLayer style={outfit.top} color={outfit.colors.top} />
                <BottomLayer style={outfit.bottom} color={outfit.colors.bottom} />
                <ShoesLayer style={outfit.shoes} color={outfit.colors.shoes} />
                <AccessoryLayer style={outfit.accessory} color={outfit.colors.accessory} />

                <div className="absolute left-1/2 top-[5.4rem] h-2 w-2 -translate-x-5 rounded-full bg-slate-800" />
                <div className="absolute left-1/2 top-[5.4rem] h-2 w-2 translate-x-3 rounded-full bg-slate-800" />
                <div className="absolute left-1/2 top-[6.4rem] h-2 w-5 -translate-x-1/2 rounded-full bg-rose-400/60" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="w-full space-y-4 lg:w-[26rem]"
        >
          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 backdrop-blur">
            <div className="grid grid-cols-3 gap-2">
              {categoryLabels.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeCategory === cat.key ? "bg-fuchsia-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {options[activeCategory].map((item) => (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  key={item.id}
                  onClick={() => dispatch({ type: "update", payload: { [activeCategory]: item.id } })}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    outfit[activeCategory] === item.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label htmlFor="color-picker" className="text-sm text-slate-300">
                Renk:
              </label>
              <input
                id="color-picker"
                type="color"
                value={outfit.colors[activeCategory]}
                onChange={(event) => dispatch({ type: "updateColor", category: activeCategory, color: event.target.value })}
                className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-slate-100">Arka Plan</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.background.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => dispatch({ type: "update", payload: { background: bg.id } })}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    outfit.background === bg.id ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600" onClick={() => dispatch({ type: "undo" })}>
                Geri Al
              </button>
              <button className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600" onClick={() => dispatch({ type: "redo" })}>
                Ileri Al
              </button>
              <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500" onClick={() => dispatch({ type: "random", payload: makeRandomOutfit() })}>
                Rastgele Stil
              </button>
              <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm hover:bg-rose-500" onClick={() => dispatch({ type: "reset", payload: baseOutfit })}>
                Sifirla
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Lookbook</p>
              <button
                onClick={() => setSavedLooks((prev) => [outfit, ...prev].slice(0, 8))}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm hover:bg-emerald-500"
              >
                Kombini Kaydet
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {savedLooks.length === 0 ? (
                <p className="text-sm text-slate-400">Henuz kayit yok.</p>
              ) : (
                savedLooks.map((look, index) => (
                  <div key={`${look.top}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 text-sm">
                    <button className="text-left text-slate-200 hover:text-white" onClick={() => dispatch({ type: "load", payload: look })}>
                      Look #{savedLooks.length - index}
                    </button>
                    <button
                      className="text-rose-300 hover:text-rose-200"
                      onClick={() => setSavedLooks((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      Sil
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Stil Gorevi</p>
              <button onClick={() => setChallenge(buildChallenge())} className="rounded-lg bg-violet-600 px-3 py-2 text-sm hover:bg-violet-500">
                Yeni Gorev
              </button>
            </div>

            {challenge ? (
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <p className="font-medium text-white">Hedef: {challenge.title}</p>
                <p>
                  {getLabel(options.hair, challenge.target.hair)} / {getLabel(options.top, challenge.target.top)} / {getLabel(options.bottom, challenge.target.bottom)} /{" "}
                  {getLabel(options.shoes, challenge.target.shoes)} / {getLabel(options.accessory, challenge.target.accessory)}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <motion.div className="h-full bg-lime-400" initial={{ width: 0 }} animate={{ width: `${challengeScore}%` }} />
                </div>
                <p className="text-white">Eslesme: %{challengeScore}</p>
                <AnimatePresence>
                  {challengeScore === 100 && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-lg bg-lime-500/20 px-3 py-2 text-lime-300"
                    >
                      Gorev tamamlandi. Yeni bir stil gorevi acabilirsin.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Hedef kombin oynamak icin Yeni Gorev sec.</p>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
