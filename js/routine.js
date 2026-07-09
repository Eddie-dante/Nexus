// js/routine.js - COMPLETE
Nexus.saveRoutine = async function() {
  const title = document.getElementById('routineTitle').value.trim();
  const content = document.getElementById('routineInput').value.trim();
  if (!title || !content) { Nexus.toast('Add title & description'); return; }

  const routine = { 
    id: Date.now().toString(), 
    title, 
    content, 
    createdAt: new Date().toISOString() 
  };

  Nexus.state.routines.unshift(routine);
  Nexus.saveLocalData();

  if (Nexus.state.online) {
    try {
      const { error } = await supabase
        .from('routines')
        .insert({
          user_id: Nexus.state.user.id,
          title: title,
          content: content,
          created_at: routine.createdAt
        });
      
      if (error) throw error;
      Nexus.toast('💾 Routine saved!');
    } catch (error) {
      console.error('Failed to save routine:', error);
      Nexus.toast('💾 Saved locally');
    }
  } else {
    Nexus.toast('💾 Saved offline');
  }

  document.getElementById('routineTitle').value = '';
  document.getElementById('routineInput').value = '';
  Nexus.renderRoutines();
};

Nexus.deleteRoutine = async function(id) {
  Nexus.state.routines = Nexus.state.routines.filter(r => r.id !== id);
  Nexus.saveLocalData();
  
  if (Nexus.state.online) {
    try {
      await supabase
        .from('routines')
        .delete()
        .eq('id', id)
        .eq('user_id', Nexus.state.user.id);
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  }
  
  Nexus.renderRoutines();
};

Nexus.renderRoutines = function() {
  const container = document.getElementById('routineEntries');
  if (!container) return;
  
  if (!Nexus.state.routines.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;">📋 No routines yet. Create one!</p>';
    return;
  }
  
  container.innerHTML = Nexus.state.routines.map(r => `
    <div class="entry-card">
      <strong>${escapeHtml(r.title)}</strong>
      <small style="color:#94a3b8;display:block;">${new Date(r.createdAt).toLocaleDateString()}</small>
      <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">${escapeHtml(r.content)}</p>
      <button class="btn-sm btn-danger" onclick="Nexus.deleteRoutine('${r.id}')" style="margin-top:5px;">🗑️</button>
    </div>
  `).join('');
};