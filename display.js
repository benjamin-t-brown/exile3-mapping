export const TILE_WIDTH = 28;
export const TILE_HEIGHT = 36;
export const ZONES_WIDTH = 9;
export const ZONES_HEIGHT = 10;
const sprites = [];
const ex3Sprites = [];

function getCtx() {
  return document.getElementById('canvas').getContext('2d');
}

export async function load() {
  await new Promise(resolve => setTimeout(resolve, 100));

  const canvas = document.getElementById('canvas');
  canvas.width = 48 * TILE_WIDTH * ZONES_WIDTH;
  canvas.height = 48 * TILE_HEIGHT * ZONES_HEIGHT;

  function _load13Hybrid(i) {
    ex3Sprites.push({ ...sprites[i + 0], origId: i + 0 });
    ex3Sprites.push({ ...sprites[i + 1], origId: i + 1 });
    ex3Sprites.push({ ...sprites[i + 1], origId: i + 1 });
    ex3Sprites.push({ ...sprites[i + 2], origId: i + 2 });
    ex3Sprites.push({ ...sprites[i + 3], origId: i + 3 });
    ex3Sprites.push({ ...sprites[i + 3], origId: i + 3 });
    ex3Sprites.push({ ...sprites[i + 4], origId: i + 4 });
    ex3Sprites.push({ ...sprites[i + 5], origId: i + 5 });
    ex3Sprites.push({ ...sprites[i + 5], origId: i + 5 });
    ex3Sprites.push({ ...sprites[i + 6], origId: i + 6 });
    ex3Sprites.push({ ...sprites[i + 7], origId: i + 7 });
    ex3Sprites.push({ ...sprites[i + 7], origId: i + 7 });
    ex3Sprites.push({ ...sprites[i + 8], origId: i + 8 });
    ex3Sprites.push({ ...sprites[i + 9], origId: i + 9 });
    ex3Sprites.push({ ...sprites[i + 10], origId: i + 10 });
    ex3Sprites.push({ ...sprites[i + 11], origId: i + 11 });
    ex3Sprites.push({ ...sprites[i + 12], origId: i + 12 });
  }

  for (let i = 1; i <= 6; i++) {
    const img = document.getElementById('ter' + i);
    const iWidth = img.width / TILE_WIDTH;
    const iHeight = img.height / TILE_HEIGHT;
    for (let i = 0; i < iHeight; i++) {
      for (let j = 0; j < iWidth; j++) {
        sprites.push({
          img,
          x: j * TILE_WIDTH,
          y: i * TILE_HEIGHT,
          w: TILE_WIDTH,
          h: TILE_HEIGHT,
        });
      }
    }
  }

  for (let i = 0; i < sprites.length; i++) {
    const spr = sprites[i];
    let iter = 1;
    if (i === 5) {
      // cave wall
      _load13Hybrid(i);
      i = i + 13;
      continue;
    }
    if (i === 19) {
      iter = 2;
    }
    if (i === 67) {
      ex3Sprites.push({ ...sprites[240], origId: i });
      ex3Sprites.push({ ...sprites[252], origId: i });
      ex3Sprites.push({ ...sprites[264], origId: i });
      ex3Sprites.push({ ...sprites[276], origId: i });
      ex3Sprites.push({ ...sprites[288], origId: i });
      ex3Sprites.push({ ...sprites[289], origId: i });
      ex3Sprites.push({ ...sprites[244], origId: i });
      ex3Sprites.push({ ...sprites[256], origId: i });
    }
    if (i === 74) {
      // combat border ?
    }
    if (i === 88) {
      iter = 2;
    }
    if (i === 90) {
      iter = 4;
    }
    if (i === 97) {
      ex3Sprites.push({ ...sprites[88], origId: i });
    }
    if (i === 100) {
      iter = 2;
    }
    if (i === 102) {
      iter = 4;
    }
    if (i === 109) {
      ex3Sprites.push({ ...sprites[100], origId: i });
    }
    if (i === 110) {
      iter = 2;
    }
    if (i === 112) {
      iter = 4;
    }
    if (i === 119) {
      ex3Sprites.push({ ...sprites[110], origId: i });
    }
    if (i === 123) {
      iter = 3;
    }
    if (i === 157) {
      iter = 2;
    }
    if (i === 181) {
      ex3Sprites.push({ ...sprites[260], origId: i });
      iter = 0;
    }
    if (i === 202) {
      //roads
      ex3Sprites.push({ ...sprites[215], origId: i });
      ex3Sprites.push({ ...sprites[215], origId: i });
      ex3Sprites.push({ ...sprites[215], origId: i });
      //torches
      ex3Sprites.push({ ...sprites[272], origId: i });
      ex3Sprites.push({ ...sprites[284], origId: i });
      //special encounters
      ex3Sprites.push({ ...sprites[207], origId: i });
      ex3Sprites.push({ ...sprites[208], origId: i });
      ex3Sprites.push({ ...sprites[209], origId: i });
      ex3Sprites.push({ ...sprites[211], origId: i });
      ex3Sprites.push({ ...sprites[211], origId: i });
      ex3Sprites.push({ ...sprites[212], origId: i });
      iter = 0;
    }
    if (i === 203) {
      ex3Sprites.push({ ...sprites[213], origId: i });
      iter = 0;
    }
    if (i === 204) {
      ex3Sprites.push({ ...sprites[214], origId: i });
      iter = 0;
    }
    if (i === 207) {
      ex3Sprites.push({ ...sprites[248], origId: i });
      ex3Sprites.push({ ...sprites[249], origId: i });
      ex3Sprites.push({ ...sprites[250], origId: i });
      ex3Sprites.push({ ...sprites[251], origId: i });
    }
    if (i === 207) {
      ex3Sprites.push({ ...sprites[181], origId: i });
      iter = 0;
    }
    if (i === 208) {
      ex3Sprites.push({ ...sprites[227], origId: i });
      iter = 0;
    }
    if (i === 209) {
      ex3Sprites.push({ ...sprites[228], origId: i });
      iter = 0;
    }
    if (i === 210) {
      ex3Sprites.push({ ...sprites[229], origId: i });
      iter = 0;
    }
    for (let j = 0; j < iter; j++) {
      ex3Sprites.push({ ...spr, origId: i });
    }
  }
}

function measureText({ text, font, size }) {
  const ctx = getCtx();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'hanging';
  size = size || 14;
  font = font || 'monospace';
  ctx.font = size + 'px ' + font;
  var width = ctx.measureText(text).width;
  var height = size;
  return {
    width,
    height,
  };
}

function drawText(text, x, y) {
  const ctx = getCtx();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.font = '12px monospace';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  const centered = true;

  if (centered) {
    const t = measureText({
      text: text,
      font: 'monospace',
      size: 14,
    });
    x -= t.width / 2;
  }

  // ctx.strokeText(text, x, y);
  // ctx.fillText(text, x, y);
}

export function drawTile(id, x, y) {
  const { x: xS, y: yS, w, h, img, origId } = ex3Sprites[id] || {};
  if (!w) {
    console.error('cannot draw sprite with id', id, ex3Sprites);
    return;
  }

  const ctx = getCtx();
  ctx.drawImage(img, xS, yS, w, h, x, y, w, h);
  //drawText(id, x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
  //drawText(origId, x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2 - 16);
}

export function drawMap(map, x, y) {
  for (let i = 0; i < 48; i++) {
    for (let j = 0; j < 48; j++) {
      const id = map[i * 48 + j];
      drawTile(id, x + i * TILE_WIDTH, y + j * TILE_HEIGHT);
    }
  }
}

export function drawAllTiles() {
  for (let i = 0; i < ex3Sprites.length; i++) {
    const x = (i % 16) * (TILE_WIDTH + 4);
    const y = Math.floor(i / 16) * (TILE_HEIGHT + 4);
    drawTile(i, x, y);
  }
}
