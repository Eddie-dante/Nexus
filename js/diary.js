// js/diary.js - Diary Logic
const Diary = {
    saveDiary() {
        const content = document.getElementById('diaryInput').value.trim();
        const mood = document.getElementById('diaryMood').value.trim() || '—';
        if (!content) {
            Nexus.toast('Write something');
            return;
        }
        Nexus.state.diary.unshift({ date: new Date().toISOString(), content: content, mood: mood });
        Auth.saveAuth();
        document.getElementById('diaryInput').value = '';
        document.getElementById('diaryMood').value = '';
        this.render();
        Nexus.toast('📝 Saved');
    },

    deleteDiary(index) {
        Nexus.state.diary.splice(index, 1);
        Auth.saveAuth();
        this.render();
    },

    render() {
        const container = document.getElementById('diaryEntries');
        if (!container) return;
        const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
        let entries = Nexus.state.diary;
        if (search) entries = entries.filter(x => x.content.toLowerCase().includes(search));
        if (entries.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + (search ? 'No matches.' : 'No entries yet.') + '</p>';
            return;
        }
        container.innerHTML = entries.map((x, i) => {
            const idx = Nexus.state.diary.indexOf(x);
            return `<div class="entry-card"><div style="display:flex;justify-content:space-between;margin-bottom:3px;"><small style="color:#94a3b8;">${new Date(x.date).toLocaleDateString()}</small><span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${x.mood}</span></div><p style="font-size:12px;white-space:pre-wrap;">${x.content}</p><button class="btn-sm btn-danger" onclick="Nexus.deleteDiary(${idx})" style="margin-top:5px;">🗑️</button></div>`;
        }).join('');
    }
};