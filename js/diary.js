Nexus.saveDiary = async function() {
  const content = document.getElementById('diaryInput').value.trim();
  const mood = document.getElementById('diaryMood').value.trim() || '—';
  if (!content) { Nexus.toast('Write something'); return; }
  await supabase.from('diary_entries').insert({ user_id: Nexus.state.user.id, content, mood });
  document.getElementById('diaryInput').value = '';
  document.getElementById('diaryMood').value = '';
  Nexus.renderDiary();
  Nexus.toast('Saved');
};

Nexus.deleteDiary = async function(id) {
  await supabase.from('diary_entries').delete().eq('id', id);
  Nexus.renderDiary();
};

Nexus.renderDiary = async function() {
  const container = document.getElementById('diaryEntries');
  if (!container) return;
  const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
  let q = supabase.from('diary_entries').select('*').eq('user_id', Nexus.state.user.id).order('created_at', { ascending: false });
  if (search) q = q.ilike('content', `%${search}%`);
  const { data } = await q;
  if (!data || !data.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + (search ? 'No matches.' : 'No entries yet.') + '</p>';
    return;
  }
  container.innerHTML = data.map(e => `
    <div class="entry-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <small style="color:#94a3b8;">${new Date(e.created_at).toLocaleDateString()}</small>
        <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${e.mood}</span>
      </div>
      <p style="font-size:12px;white-space:pre-wrap;">${e.content}</p>
      <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${e.id}')" style="margin-top:5px;">🗑️</button>
    </div>
  `).join('');
};