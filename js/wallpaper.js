const UNSPLASH = [
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
  'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1920&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
  'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=1920&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80',
  'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1920&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1920&q=80',
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
  'https://images.unsplash.com/photo-1516796181076-3a4e8a7e00d7?w=1920&q=80',
  'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=1920&q=80',
  'https://images.unsplash.com/photo-1506891536236-3e07892564b7?w=1920&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80'
];

Nexus.setWallpaper = async function(url) {
  Nexus.state.wallpaper = url;
  Nexus.setBg(url);
  await supabase.from('profiles').update({ wallpaper: url }).eq('id', Nexus.state.user.id);
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