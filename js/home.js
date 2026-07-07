Nexus.updateDashboardCounts = async function() {
  const userId = Nexus.state.session?.user?.id;
  if (!userId) return;

  const [{ count: diaryCount }, { count: msgCount }] = await Promise.all([
    supabaseClient.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabaseClient.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', userId)
  ]);

  document.getElementById('diaryCount').textContent = diaryCount || 0;
  document.getElementById('msgCount').textContent = msgCount || 0;
};

Nexus.checkStreak = async function() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = Nexus.state.completedTasks.filter(i => i < total).length;
  const today = new Date().toISOString().split('T')[0];

  if (done === total && total > 0) {
    await supabaseClient
      .from('streak_days')
      .upsert({ user_id: Nexus.state.session.user.id, streak_date: today }, { onConflict: 'user_id,streak_date' });
    Nexus.state.streakData[today] = true;
    Nexus.toast('Streak updated!');
  }
};