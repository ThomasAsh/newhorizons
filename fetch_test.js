// fetch_test.js
fetch('https://newhorizons.games/launcher/mods/client_modlist.txt')
  .then(r => r.text())
  .then(text => {
    console.log('--- File content start ---');
    console.log(text);
    console.log('--- File content end ---');
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });
