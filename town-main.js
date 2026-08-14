import {
  TILE_WIDTH,
  TILE_HEIGHT,
  load,
  drawTile,
} from './display.js';
import json from './TOWN.js';

const MAP_SIZE = 64;

function drawTownMap(record) {
  const canvas = document.getElementById('canvas');
  canvas.width = MAP_SIZE * TILE_WIDTH;
  canvas.height = MAP_SIZE * TILE_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < MAP_SIZE; row++) {
    for (let col = 0; col < MAP_SIZE; col++) {
      const id = record.map[row * MAP_SIZE + col];
      drawTile(id, col * TILE_WIDTH, row * TILE_HEIGHT);
    }
  }
}

export default async function main() {
  console.log('loading sprites...');
  await load();

  const select = document.getElementById('zones');

  // Build labels: group records by town (every 4 records = 1 town for surface towns)
  json.forEach((record, i) => {
    const names = record.names || [];
    const label = names.length > 0 ? names[0] : '';
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Town ${i}${label ? ' - ' + label : ''}`;
    select.appendChild(opt);
  });

  select.value = 0;
  select.onchange = () => drawTownMap(json[select.value]);

  drawTownMap(json[0]);
  console.log('loaded', json.length, 'town records');
}
