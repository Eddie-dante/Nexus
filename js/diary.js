Nexus.saveDiary = function() {
  const content = document.getElementById('diaryInput').value.trim();
  const mood = document.getElementById('diaryMood').value.trim() || '—';
  if (!content) { Nexus.toast('Write something'); return; }
  Nexus.state.diary.unshift({ id: Date.now().toString(), content, mood, createdAt: new Date().toISOString() });
  Nexus.saveLocalData();
  document.getElementById('diaryInput').value = '';
  document.getElementById('diaryMood').value = '';
  Nexus.renderDiary();
  Nexus.toast('Saved');
};

Nexus.deleteDiary = function(id) {
  Nexus.state.diary = Nexus.state.diary.filter(e => e.id !== id);
  Nexus.saveLocalData();
  Nexus.renderDiary();
};

Nexus.renderDiary = function() {
  const container = document.getElementById('diaryEntries');
  if (!container) return;
  const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
  let entries = Nexus.state.diary;
  if (search) entries = entries.filter(e => e.content.toLowerCase().includes(search));
  if (!entries.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + (search ? 'No matches.' : 'No entries yet.') + '</p>';
    return;
  }
  container.innerHTML = entries.map(e => `
    <div class="entry-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <small style="color:#94a3b8;">${new Date(e.createdAt).toLocaleDateString()}</small>
        <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${e.mood}</span>
      </div>
      <p style="font-size:12px;white-space:pre-wrap;">${e.content}</p>
      <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${e.id}')" style="margin-top:5px;">🗑️</button>
    </div>
  `).join('');
};