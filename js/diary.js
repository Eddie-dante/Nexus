// js/diary.js - FIXED
Nexus.saveDiary = async function() {
  const content = document.getElementById('diaryInput').value.trim();
  const mood = document.getElementById('diaryMood').value.trim() || '—';
  if (!content) { Nexus.toast('Write something'); return; }

  const entry = { 
    id: Date.now().toString(), 
    content, 
    mood, 
    createdAt: new Date().toISOString() 
  };

  Nexus.state.diary.unshift(entry);
  Nexus.saveLocalData();

  // Try to save to Supabase if online
  if (Nexus.state.online) {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: Nexus.state.user.id,
          content: content,
          mood: mood,
          created_at: entry.createdAt
        });
      
      if (error) throw error;
      Nexus.toast('💾 Saved!');
    } catch (error) {
      console.error('Failed to save diary to cloud:', error);
      // Save offline backup
      const offline = JSON.parse(localStorage.getItem('offline_diary') || '[]');
      offline.push(entry);
      localStorage.setItem('offline_diary', JSON.stringify(offline));
      Nexus.toast('💾 Saved locally (will sync when online)');
    }
  } else {
    // Save offline
    const offline = JSON.parse(localStorage.getItem('offline_diary') || '[]');
    offline.push(entry);
    localStorage.setItem('offline_diary', JSON.stringify(offline));
    Nexus.toast('💾 Saved offline');
  }

  document.getElementById('diaryInput').value = '';
  document.getElementById('diaryMood').value = '';
  Nexus.renderDiary();
};

Nexus.deleteDiary = async function(id) {
  Nexus.state.diary = Nexus.state.diary.filter(e => e.id !== id);
  Nexus.saveLocalData();
  
  if (Nexus.state.online) {
    try {
      await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', Nexus.state.user.id);
    } catch (error) {
      console.error('Failed to delete diary entry:', error);
    }
  }
  
  Nexus.renderDiary();
};

Nexus.loadDiary = async function() {
  if (!Nexus.state.online) return;
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', Nexus.state.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (data && data.length) {
      Nexus.state.diary = data.map(entry => ({
        id: entry.id,
        content: entry.content,
        mood: entry.mood || '—',
        createdAt: entry.created_at
      }));
      Nexus.saveLocalData();
    }
  } catch (error) {
    console.error('Failed to load diary:', error);
  }
};

// ✅ Helper to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

Nexus.renderDiary = function() {
  const container = document.getElementById('diaryEntries');
  if (!container) return;
  
  const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
  let entries = Nexus.state.diary;
  
  if (search) {
    entries = entries.filter(e => 
      e.content.toLowerCase().includes(search) || 
      e.mood.toLowerCase().includes(search)
    );
  }
  
  if (!entries.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + 
      (search ? '🔍 No matches.' : '📝 No entries yet. Start writing!') + 
      '</p>';
    return;
  }
  
  container.innerHTML = entries.map(e => `
    <div class="entry-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <small style="color:#94a3b8;">${new Date(e.createdAt).toLocaleDateString()} ${new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${e.mood}</span>
      </div>
      <p style="font-size:13px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(e.content)}</p>
      <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${e.id}')" style="margin-top:5px;">🗑️</button>
    </div>
  `).join('');
};