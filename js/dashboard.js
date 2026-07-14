# Create dashboard.js
echo "// js/dashboard.js - Dashboard Logic
const Dashboard = {
    getTasks() {
        let tasks = [];
        Nexus.state.selectedAuras.forEach(key => {
            if (AURAS[key]) tasks = tasks.concat(AURAS[key].tasks);
        });
        return [...new Set(tasks)].slice(0, 8);
    },

    calcScore() {
        const tasks = this.getTasks(),
            total = tasks.length,
            done = Nexus.state.completedTasks.filter(i => i < total).length;
        return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
    },

    calcStreak() {
        let s = 0;
        const n = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(n);
            d.setDate(d.getDate() - i);
            if (Nexus.state.streakData[d.toDateString()]) s++;
            else break;
        }
        return s;
    },

    toggleTask(index) {
        const idx = Nexus.state.completedTasks.indexOf(index);
        if (idx > -1) Nexus.state.completedTasks.splice(idx, 1);
        else Nexus.state.completedTasks.push(index);
        const tasks = this.getTasks(),
            total = tasks.length,
            done = Nexus.state.completedTasks.filter(x => x < total).length;
        const today = new Date().toDateString();
        if (done === total && total > 0) Nexus.state.streakData[today] = true;
        else delete Nexus.state.streakData[today];
        Auth.saveAuth();
        this.render();
    },

    resetDay() {
        if (!confirm('Reset tasks?')) return;
        Nexus.state.completedTasks = [];
        delete Nexus.state.streakData[new Date().toDateString()];
        Auth.saveAuth();
        this.render();
    },

    render() {
        if (Nexus.state.selectedAuras.length === 0) {
            Nexus.navigate('select');
            return;
        }
        const p = AURAS[Nexus.state.selectedAuras[0]],
            tasks = this.getTasks(),
            { pct, done, total } = this.calcScore();
        const streak = this.calcStreak();
        const circ = 2 * Math.PI * 43,
            offset = circ - (pct / 100) * circ;

        document.getElementById('homeTitle').textContent = Nexus.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
        document.getElementById('homeBadge').textContent = '⚡ ' + Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('');
        document.getElementById('score').textContent = pct + '%';
        document.getElementById('taskProgress').textContent = done + '/' + total;
        document.getElementById('streakCount').textContent = streak;
        document.getElementById('tasksDone').textContent = Nexus.state.completedTasks.length;
        document.getElementById('diaryCount').textContent = Nexus.state.diary.length;
        document.getElementById('msgCount').textContent = Nexus.state.chatMessages.filter(m => m.username === Nexus.state.username).length;

        const ring = document.getElementById('scoreRing');
        ring.style.strokeDashoffset = offset;
        ring.style.stroke = p.accent;

        document.getElementById('tasks').innerHTML = tasks.map((t, i) => {
            const c = Nexus.state.completedTasks.includes(i);
            return '<div class=\"task-item' + (c ? ' done' : '') + '\" onclick=\"Nexus.toggleTask(' + i + ')\"><div class=\"check-box\">' + (c ? '✓' : '') + '</div><span class=\"task-text\">' + t + '</span></div>';
        }).join('');
        this.renderCalendar();
    },

    renderCalendar() {
        const n = new Date(),
            y = n.getFullYear(),
            m = n.getMonth();
        const dim = new Date(y, m + 1, 0).getDate(),
            fd = new Date(y, m, 1).getDay();
        document.getElementById('monthLabel').textContent = n.toLocaleDateString('en', { month: 'long', year: 'numeric' });
        const cal = document.getElementById('calendar');
        cal.innerHTML = '';
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
            const div = document.createElement('div');
            div.className = 'cal-day weekday';
            div.textContent = d;
            cal.appendChild(div);
        });
        for (let i = 0; i < fd; i++) {
            const div = document.createElement('div');
            div.className = 'cal-day';
            div.style.background = 'transparent';
            cal.appendChild(div);
        }
        for (let d = 1; d <= dim; d++) {
            const ds = new Date(y, m, d).toDateString();
            const div = document.createElement('div');
            div.className = 'cal-day';
            div.textContent = d;
            if (Nexus.state.streakData[ds]) {
                div.classList.add('active');
                if (Nexus.state.selectedAuras.length) div.style.background = AURAS[Nexus.state.selectedAuras[0]].accent;
            }
            if (d === n.getDate() && m === n.getMonth() && y === n.getFullYear()) div.classList.add('today');
            cal.appendChild(div);
        }
    }
};" > js/dashboard.js