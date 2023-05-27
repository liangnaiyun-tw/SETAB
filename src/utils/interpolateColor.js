
function interpolateColorByIndex(index, totalLength) {
  let g;
  let r;
  let b = 70;

  if (index < totalLength / 2) {
    g = 255;
    r = Math.round((index / (totalLength / 2 - 1)) * 255);
  } else {
    g = Math.round(((totalLength - 1 - index) / (totalLength / 2 - 1)) * 255);
    r = 255;
  }

  return [r, g, b];
}

export { interpolateColorByIndex };