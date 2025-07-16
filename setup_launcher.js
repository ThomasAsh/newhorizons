const fs = require('fs').promises;
const fetch = require('node-fetch'); // make sure node-fetch v2 is installed: npm install node-fetch@2

const MODLIST_URL = 'https://newhorizons.games/launcher/mods/client_modlist.txt';
const OUTPUT_PATH = './app/distros/NewHorizons.json';

async function fetchModlist() {
  const res = await fetch(MODLIST_URL);
  if (!res.ok) throw new Error(`Failed to fetch modlist: ${res.statusText}`);
  const text = await res.text();
  return text;
}

function parseModlist(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

async function generateDistroJson(mods) {
  const distro = {
    id: 'newhorizons',
    name: 'New Horizons',
    icon: 'https://newhorizons.games/assets/NewHorizons-1024.png',
    discordAppId: '1394928830665457736',
    newsFeed: 'https://newhorizons.games/feed/',
    mods,
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(distro, null, 2), 'utf8');
  console.log(`✅ Generated ${OUTPUT_PATH} with ${mods.length} mods`);
}

async function main() {
  try {
    const modlistText = await fetchModlist();
    const mods = parseModlist(modlistText);
    if (mods.length === 0) {
      console.warn('⚠️ Warning: No mods found in modlist');
    }
    await generateDistroJson(mods);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();
