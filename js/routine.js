# Create routine.js
echo "// js/routine.js - Routine Logic
const Routine = {
    saveRoutine() {
        const title = document.getElementById('routineTitle').value.trim();
        const content = document.getElementById('routineInput').value.trim();
        if (!title || !content) {
            Nexus.toast('Add title & description');
            return;
        }
        Nexus.state.routines.unshift({ id: Date.now(), title: title, content: content, date: new Date().toISOString() });
        Auth.saveAuth();
        document.getElementById('routineTitle').value = '';
        document.getElementById('routineInput').value = '';
        this.render();
        Nexus.toast('📋 Saved');
    },

    deleteRoutine(id) {
        Nexus.state.routines = Nexus.state.routines.filter(r => r.id !== id);
        Auth.saveAuth();
        this.render();
    },

    render() {
        const container = document.getElementById('routineEntries');
        if (!container) return;
        if (Nexus.state.routines.length === 0) {
            container.innerHTML = '<p style=\"color:#94a3b8;text-align:center;\">No routines yet.</p>';
            return;
        }
        container.innerHTML = Nexus.state.routines.map(r =>
            '<div class=\"entry-card\"><strong>' + r.title + '</strong><small style=\"color:#94a3b8;display:block;\">' + new Date(r.date).toLocaleDateString() + '</small><p style=\"font-size:12px;margin-top:3px;white-space:pre-wrap;\">' + r.content + '</p><button class=\"btn-sm btn-danger\" onclick=\"Nexus.deleteRoutine(' + r.id + ')\" style=\"margin-top:5px;\">🗑️</button></div>'
        ).join('');
    }
};" > js/routine.js