const kundliStore = new Map();

export function saveKundli(hash, data) {
  kundliStore.set(hash, data);
}

export function getKundli(hash) {
  return kundliStore.get(hash);
}
