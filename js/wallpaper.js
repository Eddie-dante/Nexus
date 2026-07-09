// js/wallpapers.js - COMPLETE
const UNSPLASH = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459606-7b9ec58a3b43?w=1920&q=80',
  'https://images.unsplash.com/photo-1440589473619-3cde28941638?w=1920&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
  'https://images.unsplash.com/photo-1511818966892-d7b671e67291?w=1920&q=80',
  'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1920&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
  'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=1920&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1920&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
  'https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=1920&q=80',
  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
  'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1920&q=80',
  'https://images.unsplash.com/photo-1471922694854-ff1b63b20036?w=1920&q=80',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=80',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=1920&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
  'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?w=1920&q=80',
  'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=1920&q=80',
  'https://images.unsplash.com/photo-1506891536236-3e07892564b7?w=1920&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80',
  'https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=1920&q=80',
  'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1920&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80',
  'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&q=80',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=80',
  'https://images.unsplash.com/photo-1515630278258-407f66498911?w=1920&q=80',
  'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
  'https://images.unsplash.com/photo-1516796181076-3a4e8a7e00d7?w=1920&q=80'
];

Nexus.setWallpaper = function(url) {
  Nexus.state.wallpaper = url;
  Nexus.setBg(url);
  Nexus.saveLocalData();
  Nexus.renderWallpapers();
  Nexus.toast('Applied');
};

Nexus.randomWallpaper = function() {
  Nexus.setWallpaper(UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]);
};

Nexus.renderWallpapers = function() {
  document.getElementById('wpCount').textContent = UNSPLASH.length + '+ wallpapers';
  document.getElementById('wpGrid').innerHTML = UNSPLASH.map(url => {
    const selected = Nexus.state.wallpaper === url;
    return `<div class="wp-thumb${selected ? ' selected' : ''}" style="background-image:url('${url}')" onclick="Nexus.setWallpaper('${url}')"></div>`;
  }).join('');
};