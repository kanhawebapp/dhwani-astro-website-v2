
const CONTENT_LOADERS = {
  gemfol: () => import("./gemstone"),
  rudrafol: () => import("./rudraksha"),
  lalkitab: () => import("./lalkitab"),
  kp: () => import("./kp"),
  manglik: () => import("./manglik"),
  kalsharp: () => import("./kalsharp"),
  sadesati: () => import("./sadesati"),
  nakform: () => import("./nakform"),
  numerokundali: () => import("./numerokundali"),
  kundlislug: () => import("./kundalimalan"),
};

export async function loadAstroContent(slug) {
  const loader = CONTENT_LOADERS[slug];

  if (!loader) return null;

  const remedyModule = await loader();
  return remedyModule.default;
}
