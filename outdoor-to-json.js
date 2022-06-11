const fs = require('fs');
const data = fs.readFileSync('./OUTDOOR.DAT');

const ZONE_LENGTH = 3220; // bytes
const MAP_WIDTH = 48;
const MAP_HEIGHT = 48;
const NUM_ZONES = data.length / ZONE_LENGTH;

console.log('LENGTH', data.length, 'bytes', NUM_ZONES, 'zones');

function parseZone(zoneOffset) {
  const zone = {
    map: [],
  };

  for (let i = 0; i < MAP_HEIGHT; i++) {
    for (let j = 0; j < MAP_WIDTH; j++) {
      const tileId = data.readUInt8(zoneOffset + i * 48 + j);
      zone.map.push(tileId);
    }
  }

  return zone;
}

const zones = [];
for (let i = 0; i < NUM_ZONES; i++) {
  zones.push(parseZone(i * ZONE_LENGTH));
}

fs.writeFileSync('./OUTDOOR.js', `export default ${JSON.stringify(zones, null, 2)}`);
console.log('FILE WRITTEN', './OUTDOOR.js');
