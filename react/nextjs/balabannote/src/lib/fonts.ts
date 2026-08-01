/** Yazı tipi kataloğu: sistem + Google kütüphanesi (+ yerelde queryLocalFonts) */

export type FontOption = {
  id: string;
  /** CSS font-family değeri */
  family: string;
  label: string;
  source: "system" | "library" | "local";
};

/** Yaygın sistem / yüklü masaüstü yazı tipleri */
export const SYSTEM_FONTS: FontOption[] = [
  { id: "inherit", family: "inherit", label: "Varsayılan", source: "system" },
  { id: "segoe", family: '"Segoe UI", Tahoma, sans-serif', label: "Segoe UI", source: "system" },
  { id: "arial", family: "Arial, Helvetica, sans-serif", label: "Arial", source: "system" },
  { id: "helvetica", family: "Helvetica, Arial, sans-serif", label: "Helvetica", source: "system" },
  { id: "verdana", family: "Verdana, Geneva, sans-serif", label: "Verdana", source: "system" },
  { id: "tahoma", family: "Tahoma, Geneva, sans-serif", label: "Tahoma", source: "system" },
  { id: "trebuchet", family: '"Trebuchet MS", Helvetica, sans-serif', label: "Trebuchet MS", source: "system" },
  { id: "calibri", family: "Calibri, Candara, sans-serif", label: "Calibri", source: "system" },
  { id: "georgia", family: "Georgia, serif", label: "Georgia", source: "system" },
  { id: "times", family: '"Times New Roman", Times, serif', label: "Times New Roman", source: "system" },
  { id: "cambria", family: "Cambria, Georgia, serif", label: "Cambria", source: "system" },
  { id: "garamond", family: "Garamond, Baskerville, serif", label: "Garamond", source: "system" },
  { id: "palatino", family: '"Palatino Linotype", Palatino, serif', label: "Palatino", source: "system" },
  { id: "courier", family: '"Courier New", Courier, monospace', label: "Courier New", source: "system" },
  { id: "consolas", family: "Consolas, Monaco, monospace", label: "Consolas", source: "system" },
  { id: "lucida", family: '"Lucida Console", Monaco, monospace', label: "Lucida Console", source: "system" },
  { id: "comic", family: '"Comic Sans MS", "Comic Sans", cursive', label: "Comic Sans MS", source: "system" },
  { id: "impact", family: "Impact, Haettenschweiler, sans-serif", label: "Impact", source: "system" },
];

/** Google Fonts kütüphanesi (layout’ta yüklenir) */
export const LIBRARY_FONTS: FontOption[] = [
  { id: "inter", family: '"Inter", sans-serif', label: "Inter", source: "library" },
  { id: "roboto", family: '"Roboto", sans-serif', label: "Roboto", source: "library" },
  { id: "open-sans", family: '"Open Sans", sans-serif', label: "Open Sans", source: "library" },
  { id: "lato", family: '"Lato", sans-serif', label: "Lato", source: "library" },
  { id: "montserrat", family: '"Montserrat", sans-serif', label: "Montserrat", source: "library" },
  { id: "poppins", family: '"Poppins", sans-serif', label: "Poppins", source: "library" },
  { id: "nunito", family: '"Nunito", sans-serif', label: "Nunito", source: "library" },
  { id: "source-sans", family: '"Source Sans 3", sans-serif', label: "Source Sans 3", source: "library" },
  { id: "work-sans", family: '"Work Sans", sans-serif', label: "Work Sans", source: "library" },
  { id: "rubik", family: '"Rubik", sans-serif', label: "Rubik", source: "library" },
  { id: "ubuntu", family: '"Ubuntu", sans-serif', label: "Ubuntu", source: "library" },
  { id: "noto-sans", family: '"Noto Sans", sans-serif', label: "Noto Sans", source: "library" },
  { id: "merriweather", family: '"Merriweather", serif', label: "Merriweather", source: "library" },
  { id: "playfair", family: '"Playfair Display", serif', label: "Playfair Display", source: "library" },
  { id: "libre-baskerville", family: '"Libre Baskerville", serif', label: "Libre Baskerville", source: "library" },
  { id: "lora", family: '"Lora", serif', label: "Lora", source: "library" },
  { id: "pt-serif", family: '"PT Serif", serif', label: "PT Serif", source: "library" },
  { id: "crimson", family: '"Crimson Text", serif', label: "Crimson Text", source: "library" },
  { id: "eb-garamond", family: '"EB Garamond", serif', label: "EB Garamond", source: "library" },
  { id: "spectral", family: '"Spectral", serif', label: "Spectral", source: "library" },
  { id: "jetbrains", family: '"JetBrains Mono", monospace', label: "JetBrains Mono", source: "library" },
  { id: "fira-code", family: '"Fira Code", monospace', label: "Fira Code", source: "library" },
  { id: "source-code", family: '"Source Code Pro", monospace', label: "Source Code Pro", source: "library" },
  { id: "space-grotesk", family: '"Space Grotesk", sans-serif', label: "Space Grotesk", source: "library" },
  { id: "dm-sans", family: '"DM Sans", sans-serif', label: "DM Sans", source: "library" },
  { id: "outfit", family: '"Outfit", sans-serif', label: "Outfit", source: "library" },
  { id: "manrope", family: '"Manrope", sans-serif', label: "Manrope", source: "library" },
  { id: "caveat", family: '"Caveat", cursive', label: "Caveat", source: "library" },
  { id: "pacifico", family: '"Pacifico", cursive', label: "Pacifico", source: "library" },
  { id: "dancing", family: '"Dancing Script", cursive', label: "Dancing Script", source: "library" },
];

/** Google Fonts CSS2 URL (tek stylesheet) */
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@400;600;700",
    "family=Roboto:wght@400;500;700",
    "family=Open+Sans:wght@400;600;700",
    "family=Lato:wght@400;700",
    "family=Montserrat:wght@400;600;700",
    "family=Poppins:wght@400;500;600;700",
    "family=Nunito:wght@400;600;700",
    "family=Source+Sans+3:wght@400;600;700",
    "family=Work+Sans:wght@400;600;700",
    "family=Rubik:wght@400;500;700",
    "family=Ubuntu:wght@400;500;700",
    "family=Noto+Sans:wght@400;600;700",
    "family=Merriweather:wght@400;700",
    "family=Playfair+Display:wght@400;600;700",
    "family=Libre+Baskerville:wght@400;700",
    "family=Lora:wght@400;600;700",
    "family=PT+Serif:wght@400;700",
    "family=Crimson+Text:wght@400;600;700",
    "family=EB+Garamond:wght@400;600;700",
    "family=Spectral:wght@400;600;700",
    "family=JetBrains+Mono:wght@400;600",
    "family=Fira+Code:wght@400;600",
    "family=Source+Code+Pro:wght@400;600",
    "family=Space+Grotesk:wght@400;600;700",
    "family=DM+Sans:wght@400;500;700",
    "family=Outfit:wght@400;600;700",
    "family=Manrope:wght@400;600;700",
    "family=Caveat:wght@400;600;700",
    "family=Pacifico",
    "family=Dancing+Script:wght@400;600;700",
  ].join("&") +
  "&display=swap";

export function localFontOption(familyName: string): FontOption {
  const safe = familyName.replace(/"/g, "");
  return {
    id: `local:${safe}`,
    family: `"${safe}"`,
    label: safe,
    source: "local",
  };
}
