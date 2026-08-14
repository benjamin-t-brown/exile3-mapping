const fs = require('fs');
const data = fs.readFileSync('./TOWN.DAT');

const RECORD_SIZE = 6962;
const TERRAIN_OFFSET = 0x420;
const MAP_SIZE = 64;
const NUM_RECORDS = Math.floor(data.length / RECORD_SIZE);

console.log('LENGTH', data.length, 'bytes', NUM_RECORDS, 'records');

function parseRecord(recordOffset) {
  const record = {
    map: [],
  };

  for (let row = 0; row < MAP_SIZE; row++) {
    for (let col = 0; col < MAP_SIZE; col++) {
      const tileId = data.readUInt8(recordOffset + TERRAIN_OFFSET + row * MAP_SIZE + col);
      record.map.push(tileId);
    }
  }

  // Try to find building/room names in the record for labeling
  const chunk = data.slice(recordOffset, recordOffset + RECORD_SIZE);
  const names = [];
  for (let i = 0; i < chunk.length - 4; i++) {
    // Look for sequences of printable chars that start with uppercase
    if (chunk[i] >= 0x41 && chunk[i] <= 0x5a) { // A-Z
      let end = i;
      while (end < chunk.length && chunk[end] >= 0x20 && chunk[end] <= 0x7e) {
        end++;
      }
      const s = chunk.slice(i, end).toString('ascii').trim();
      if (s.length >= 4 && /[a-z]/.test(s) && /^[A-Z]/.test(s)) {
        names.push(s);
        i = end;
      }
    }
  }
  record.names = names.slice(0, 10);

  return record;
}

const records = [];
for (let i = 0; i < NUM_RECORDS; i++) {
  records.push(parseRecord(i * RECORD_SIZE));
}

fs.writeFileSync('./TOWN.js', `export default ${JSON.stringify(records)}`);
console.log('FILE WRITTEN', './TOWN.js', NUM_RECORDS, 'records');
