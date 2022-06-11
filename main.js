import {
  TILE_WIDTH,
  TILE_HEIGHT,
  ZONES_WIDTH,
  ZONES_HEIGHT,
  load,
  drawMap,
  drawAllTiles,
} from './display.js';
import json from './OUTDOOR.js';

export default async function main() {
  console.log('load');
  await load();

  const select = document.getElementById('zones');
  select.innerHTML += json.reduce(
    (prev, curr, i) => prev + `<option value="${i}">Zone ${i}</option>`,
    ''
  );
  select.value = json.length - 1;
  // select.onchange = ev => drawMap(json[ev.target.value].map);

  console.log('JSON', json);
  drawMap(json[json.length - 1].map);
  for (let i = 0; i < ZONES_HEIGHT; i++) {
    for (let j = 0; j < ZONES_WIDTH; j++) {
      drawMap(json[i * ZONES_WIDTH + j].map, j * TILE_WIDTH * 48, i * TILE_HEIGHT * 48);
    }
  }
  //drawAllTiles();
}
