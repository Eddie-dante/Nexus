Nexus.saveRoutine = async function() {
  const title = document.getElementById('routineTitle').value.trim();
  const content = document.getElementById('routineInput').value.trim();
  if (!title || !content) { Nexus.toast('Add title & description'); return; }

  const { error } = await supabaseClient
    .from('routines')
    .insert({ user_id: Nexus.state.session.user.id, title, content });

  if (error) { Nexus.toast('Error saving'); return; }

  document.getElementById('routineTitle').value = '';
  document.getElementById('routineInput').value = '';
  Nexus.renderRoutines();
  Nexus.toast('Saved');
};

Nexus.deleteRoutine = async function(id) {
  await supabaseClient.from('routines').delete().eq('id', id);
  Nexus.renderRoutines();
};

Nexus.renderRoutines = async function() {
  const container = document.getElementById('routineEntries');
  if (!container) return;

  const { data: routines } = await supabaseClient
    .from('routines')
    .select('*')
    .eq('user_id', Nexus.state.session.user.id)
    .order('created_at', { ascending: false });

  if (!routines || routines.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No routines yet.</p>';
    return;
  }

  container.innerHTML = routines.map(r => `
    <div class="entry-card">
      <strong>${r.title}</strong>
      <small style="color:#94a3b8;display:block;">${new Date(r.created_at).toLocaleDateString()}</small>
      <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">${r.content}</p>
      <button class="btn-sm btn-danger" onclick="Nexus.deleteRoutine('${r.id}')" style="margin-top:5px;">🗑️</button>
    </div>
  `).join('');
};