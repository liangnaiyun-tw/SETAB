function createHash256Str() {
  let hash = "";
  for (let i = 1; i <= 64; ++i) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export { createHash256Str };