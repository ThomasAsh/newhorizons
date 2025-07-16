<<<<<<< HEAD
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const inquirer = require('inquirer');

async function getModInfo(slug) {
  // Modrinth lookup
  const res = await fetch(`https://api.modrinth.com/v2/project/${slug}/version`);
  if (!res.ok) throw new Error(`Lookup failed for ${slug}`);
  return (await res.json())[0];
}

(async () => {
  // 1) Prompt for launcher metadata
  const answers = await inquirer.prompt([
    { name: 'version', message: 'Launcher version', default: '0.1.0' },
    { name: 'discordClientId', message: 'Discord Application ID (Rich Presence)', default: '' },
    { name: 'iconURL', message: 'Launcher icon URL', default: 'https://newhorizons.games/assets/NewHorizons-1024.png' },
    { name: 'rssURL', message: 'News RSS feed URL', default: 'https://newhorizons.games/feed/' },
    { name: 'modList', message: 'Path or URL to server_modlist.txt', default: 'server_modlist.txt' }
  ]);

  // 2) Fetch or read mod list
  let lines;
  if (answers.modList.startsWith('http')) {
    const txt = await fetch(answers.modList).then(r=>r.text());
    lines = txt.split(/\r?\n/);
  } else {
    lines = fs.readFileSync(answers.modList, 'utf-16').toString().split(/\r?\n/);
  }
  const mods = lines.filter(Boolean);

  // 3) Gather module entries
  const modules = [];
  console.log(`Fetching info for ${mods.length} mods…`);
  for (const file of mods) {
    const slug = path.basename(file, '.jar');
    try {
      const info = await getModInfo(slug);
      const f = info.files[0];
      modules.push({
        id: `mods/${file}`,
        name: info.name,
        type: 'File',
        artifact: {
          size: f.size,
          MD5: f.hashes.md5,
          url: f.url,
          path: `mods/${file}`
        }
      });
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.warn(`  ✗ ${file}: ${err.message}`);
    }
  }

  // 4) Build distribution JSON
  const distro = {
    version: answers.version,
    discord: { clientId: answers.discordClientId },
    rss: answers.rssURL,
    servers: [{
      id: 'NewHorizons',
      name: 'New Horizons Launcher',
      description: 'Join the ultimate New Horizons survival experience!',
      icon: answers.iconURL,
      version: answers.version,
      address: 'play.newhorizons.games',
      minecraftVersion: '1.21.1',
      mainServer: true,
      autoconnect: true,
      modules
    }]
  };
  fs.writeFileSync(path.join('app','distros','NewHorizons.json'), JSON.stringify(distro, null, 2));
  console.log('✅ Generated app/distros/NewHorizons.json');
})();
=======
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
>>>>>>> 5303dc2 (Save changes before pull)
