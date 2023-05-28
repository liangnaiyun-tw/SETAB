function createHash32Str() {
  let hash = "";
  for (let i = 1; i <= 8; ++i) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export { createHash32Str };