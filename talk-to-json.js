const fs = require('fs');
const path = require('path');

const EXE_PATH = './Exile3/EXILE3.EXE';
const TALK_START = 0x229601;
const OUT_DIR = './conversations';

// Exile 3 stores each town's conversations as packed Pascal strings
// (1-byte length + data) in EXILE3.EXE, with occasional zero-padding
// to 256-byte alignment. Nodes are ASCII:
//   personality^kw1^kw2^type^ex0^ex1^ex2^ex3^99
//
// Per town:
//   10 titles
//   10 x (look, name, job)
//   10 dunno (unknown-keyword) responses
//   talk nodes (unused slots are p^xxxx^xxxx^0^0^0^0^0^99), each followed by str1 and str2
//
// Personality IDs are global: town T uses IDs T*10+1 .. T*10+10.
// Default keywords Look / Name / Job are not stored as nodes; they
// use the look/name/job strings on each person.

const MAX_NODES_PER_TOWN = 200;

const NODE_TYPES = {
  0: 'regular',
  1: 'depend_on_sdf',
  2: 'set_sdf',
  3: 'inn',
  4: 'depend_on_time',
  5: 'shop_armor',
  6: 'sell_armor',
  7: 'shop_weapons',
  8: 'sell_weapons',
  9: 'training',
  10: 'shop_drinks',
  11: 'shop_food',
  12: 'shop_items',
  13: 'sell_items',
  14: 'shop_mage_spells',
  15: 'shop_priest_spells',
  16: 'shop_alchemy',
  17: 'shop_misc',
  18: 'healer',
  19: 'identify',
  20: 'enchant',
  21: 'buy_service',
  22: 'buy_town_map',
  23: 'end_talk',
  24: 'buy_location',
  25: 'job_bank',
  26: 'npc_leaves',
  27: 'start_fight',
  28: 'depend_on_event',
};

const PLACEHOLDER_TITLE = /^\s*n\d+\s*$/;
const PLACEHOLDER_TEXT = /^[lnj?]\d+$/;

const buf = fs.readFileSync(EXE_PATH);

function pascal(off) {
  if (off < 0 || off >= buf.length) return null;
  const len = buf[off];
  if (off + 1 + len > buf.length) return null;
  return {
    off,
    len,
    str: buf.slice(off + 1, off + 1 + len).toString('latin1'),
    next: off + 1 + len,
  };
}

function peekIsNode(off) {
  const p = pascal(off);
  return !!(p && isNodeString(p.str));
}

// Skip zero-fill that pads the next Pascal string to a 256-byte boundary.
// Does not consume genuine empty strings (a single 0x00 length byte).
function skipAlignPadding(off, end) {
  if (off >= end || buf[off] !== 0) return off;
  let z = 0;
  while (off + z < end && buf[off + z] === 0) z++;
  const next = off + z;
  if (next <= off || next > end) return off;
  if (next % 256 === 0 && buf[next] > 0 && !peekIsNode(next)) return next;
  return off;
}

function readPascal(off, end) {
  off = skipAlignPadding(off, end);
  const p = pascal(off);
  if (!p || p.next > end) return { ok: false, off, str: '', next: off };
  return { ok: true, off, str: p.str, next: p.next };
}

function readResponse(off, end) {
  off = skipAlignPadding(off, end);
  if (peekIsNode(off)) return { ok: true, str: '', next: off };
  return readPascal(off, end);
}

function readNStrings(off, n, end) {
  const strs = [];
  for (let i = 0; i < n; i++) {
    const p = readPascal(off, end);
    if (!p.ok) {
      return { strs, next: off, ok: false, reason: `eof reading string ${i} at ${off.toString(16)}` };
    }
    strs.push(p.str);
    off = p.next;
  }
  return { strs, next: off, ok: true };
}

function typeName(type) {
  if (NODE_TYPES[type]) return NODE_TYPES[type];
  if (type >= 100) return 'call_special';
  return 'unknown';
}

function isNodeString(s) {
  const parts = s.split('^');
  if (parts.length < 8) return false;
  if (parts[0] !== 'p' && !/^\d+$/.test(parts[0])) return false;
  if (!/^[a-z0-9]{4}$/.test(parts[1]) || !/^[a-z0-9]{4}$/.test(parts[2])) return false;
  const nums = parts.slice(3).filter((n) => n !== '');
  if (nums.length < 4) return false;
  return nums.every((n) => /^-?\d+$/.test(n));
}

function parseNode(raw, str1, str2) {
  if (!isNodeString(raw)) return null;
  const parts = raw.split('^');
  const unused = parts[0] === 'p';
  const personality = unused ? null : parseInt(parts[0], 10);
  const keywords = [parts[1]];
  if (parts[2] !== 'xxxx') keywords.push(parts[2]);
  const nums = parts.slice(3).filter((n) => n !== '').map((v) => parseInt(v, 10));
  const type = nums[0];
  let extras = nums.slice(1);
  if (extras[extras.length - 1] === 99) extras = extras.slice(0, -1);
  return {
    unused,
    personality,
    keywords,
    type,
    typeName: typeName(type),
    extras,
    specialId: type >= 100 ? type : undefined,
    str1,
    str2,
  };
}

function looksLikeTitle(s) {
  if (PLACEHOLDER_TITLE.test(s) || s === '') return true;
  if (s.length > 40 || s.length === 0) return false;
  if (isNodeString(s) || s.includes('^')) return false;
  if (s.startsWith('_') || s.startsWith('You ')) return false;
  return true;
}

function isUnusedPerson(title, look, name, job) {
  if (PLACEHOLDER_TITLE.test(title) || title === '') return true;
  const texts = [look, name, job];
  return texts.every((t) => t === '' || PLACEHOLDER_TEXT.test(t));
}

function parseTown(start, end) {
  let off = start;
  while (off < end && buf[off] === 0) off++;

  const titles = readNStrings(off, 10, end);
  if (!titles.ok) return { ok: false, reason: titles.reason, next: start };
  const titleLike = titles.strs.filter((s) => looksLikeTitle(s)).length;
  if (titleLike < 3) {
    return { ok: false, reason: `titles don't look like names at ${off.toString(16)}: ${JSON.stringify(titles.strs.slice(0, 4))}`, next: start };
  }
  off = titles.next;

  const looks = [];
  const names = [];
  const jobs = [];
  for (let i = 0; i < 10; i++) {
    const triple = readNStrings(off, 3, end);
    if (!triple.ok) return { ok: false, reason: triple.reason, next: start };
    looks.push(triple.strs[0]);
    names.push(triple.strs[1]);
    jobs.push(triple.strs[2]);
    off = triple.next;
  }

  const dunnos = readNStrings(off, 10, end);
  if (!dunnos.ok) return { ok: false, reason: dunnos.reason, next: start };
  off = dunnos.next;

  const rawNodes = [];
  while (rawNodes.length < MAX_NODES_PER_TOWN) {
    let probe = off;
    while (probe < end && buf[probe] === 0) probe++;
    const desc = pascal(probe);
    if (!desc || !isNodeString(desc.str)) break;
    off = desc.next;
    const s1 = readResponse(off, end);
    if (!s1.ok) return { ok: false, reason: `missing str1 node ${rawNodes.length}`, next: start };
    off = s1.next;
    const s2 = readResponse(off, end);
    if (!s2.ok) return { ok: false, reason: `missing str2 node ${rawNodes.length}`, next: start };
    off = s2.next;
    const node = parseNode(desc.str, s1.str, s2.str);
    if (!node) return { ok: false, reason: `unparsed node ${rawNodes.length}`, next: start };
    rawNodes.push(node);
  }

  const usedIds = rawNodes.filter((n) => n.personality != null).map((n) => n.personality);
  const personalityBase = usedIds.length ? Math.floor((Math.min(...usedIds) - 1) / 10) * 10 + 1 : null;
  const townId = personalityBase != null ? Math.floor((personalityBase - 1) / 10) : null;

  const people = titles.strs.map((title, slot) => {
    const id = personalityBase != null ? personalityBase + slot : null;
    const personNodes = rawNodes
      .filter((n) => !n.unused && n.personality === id)
      .map(({ unused, personality, ...rest }) => rest);
    const unused = isUnusedPerson(title, looks[slot], names[slot], jobs[slot]) && personNodes.length === 0;
    if (unused) return null;
    return {
      id,
      slot,
      title,
      look: looks[slot],
      name: names[slot],
      job: jobs[slot],
      dunno: dunnos.strs[slot],
      nodes: personNodes,
    };
  }).filter(Boolean);

  if (rawNodes.length === 0 || people.length === 0) {
    return { ok: false, reason: `no nodes/people at ${start.toString(16)}`, next: off };
  }

  return {
    ok: true,
    townId,
    personalityBase,
    people,
    unusedNodeCount: rawNodes.filter((n) => n.unused).length,
    next: off,
  };
}

function labelForTown(town) {
  const titles = town.people.filter((p) => p.title).map((p) => p.title);
  return titles.slice(0, 6).join(', ') || `town ${town.townId}`;
}

const towns = [];
let off = TALK_START;
const end = buf.length;
for (let t = 0; t < 250; t++) {
  const parsed = parseTown(off, end);
  if (!parsed.ok) {
    console.log('Stopped after', towns.length, 'towns:', parsed.reason);
    break;
  }
  towns.push(parsed);
  off = parsed.next;
}

console.log('Parsed', towns.length, 'talk records, end at', off.toString(16));

fs.mkdirSync(OUT_DIR, { recursive: true });

const index = towns.map((town, i) => {
  const people = town.people.map((p) => ({
    id: p.id,
    title: p.title,
    nodeCount: p.nodes.length,
  }));
  const file = `town-${String(i).padStart(3, '0')}.json`;
  const record = {
    talkRecord: i,
    townId: town.townId,
    personalityBase: town.personalityBase,
    label: labelForTown(town),
    people: town.people,
  };
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(record, null, 2));
  return {
    file,
    talkRecord: i,
    townId: town.townId,
    personalityBase: town.personalityBase,
    label: labelForTown(town),
    npcCount: people.length,
    people,
  };
});

fs.writeFileSync(
  path.join(OUT_DIR, 'index.json'),
  JSON.stringify(
    {
      source: 'Exile3/EXILE3.EXE',
      format:
        'Everyone responds to Look, Name, and Job using those strings on each person. Extra keywords are 4-character prefixes (purc matches purchase). Underscores in dialogue are quotation marks. Node type 100+ calls a town special with that id.',
      townCount: index.length,
      npcCount: index.reduce((n, t) => n + t.npcCount, 0),
      towns: index,
    },
    null,
    2
  )
);

const npcCount = index.reduce((n, t) => n + t.npcCount, 0);
const nodeCount = towns.reduce(
  (n, t) => n + t.people.reduce((m, p) => m + p.nodes.length, 0),
  0
);
console.log('Wrote', towns.length, 'files to', OUT_DIR);
console.log('NPCs:', npcCount, 'keyword nodes:', nodeCount);
index.forEach((t) => {
  console.log(String(t.townId).padStart(3), t.label);
});
