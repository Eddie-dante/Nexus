// js/profile.js - Profile Logic
const Profile = {
    editProfile() {
        const newBio = prompt('Edit your bio:', Nexus.state.bio || '');
        if (newBio !== null) {
            Nexus.state.bio = newBio.trim() || 'Building my energy. One aura at a time. ⚡';
            Auth.saveAuth();
            this.render();
            Nexus.toast('✅ Bio updated');
        }
    },

    render() {
        const avatarEmoji = Nexus.state.selectedAuras.length > 0 ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
        document.getElementById('profileAvatarEmoji').textContent = avatarEmoji;
        document.getElementById('profileName').textContent = Nexus.state.username || '—';
        document.getElementById('profileUsername').textContent = '@' + (Nexus.state.username || '—');
        document.getElementById('profilePosts').textContent = Nexus.state.posts.length;
        document.getElementById('profileFollowers').textContent = Math.floor(Math.random() * 100) + 10;
        document.getElementById('profileFollowing').textContent = Math.floor(Math.random() * 50) + 5;
        document.getElementById('profileBio').textContent = Nexus.state.bio || 'Building my energy. One aura at a time. ⚡';

        const grid = document.getElementById('profilePostsGrid');
        const userPosts = Nexus.state.posts.filter(p => p.author === Nexus.state.username);
        if (userPosts.length === 0) {
            grid.innerHTML = '<p style="color:#94a3b8;text-align:center;grid-column:1/-1;padding:16px 0;">No posts yet.</p>';
            return;
        }
        grid.innerHTML = userPosts.map(p =>
            `<div style="aspect-ratio:1;background-image:url('${p.image || UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]}');background-size:cover;background-position:center;border-radius:4px;cursor:pointer;" onclick="Nexus.toast('${p.text.substring(0, 30)}...')"></div>`
        ).join('');
    }
};