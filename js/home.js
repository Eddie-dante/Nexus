Nexus.updateDashboardCounts = async function() {
  const userId = Nexus.state.user?.id;
  if (!userId) return;
  const [{ count: dCount }, { count: mCount }] = await Promise.all([
    supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  ]);
  document.getElementById('diaryCount').textContent = dCount || 0;
  document.getElementById('msgCount').textContent = mCount || 0;
};