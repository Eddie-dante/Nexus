// ==================== GLOBAL FUNCTIONS FOR HTML ====================
window.handleSignup = function() {
    const name = document.getElementById('signupName')?.value.trim();
    const user = document.getElementById('signupUser')?.value.trim();
    const pass = document.getElementById('signupPass')?.value.trim();
    
    if (!name || !user || !pass) {
        Nexus.toast('Please fill all fields');
        return;
    }
    
    const users = Storage.getUsers();
    if (users.find(u => u.username === user)) {
        Nexus.toast('Username already exists');
        return;
    }
    
    const newUser = {
        id: 'user_' + Date.now(),
        username: user,
        password: pass,
        name: name,
        created: new Date().toISOString()
    };
    
    users.push(newUser);
    Storage.setUsers(users);
    Storage.setUser({ id: newUser.id, username: newUser.username });
    
    Nexus.toast('Account created! Welcome ' + name);
    Nexus.navigate('select');
};

window.handleLogin = function() {
    const user = document.getElementById('loginUser')?.value.trim();
    const pass = document.getElementById('loginPass')?.value.trim();
    
    if (!user || !pass) {
        Nexus.toast('Enter username and password');
        return;
    }
    
    const users = Storage.getUsers();
    const found = users.find(u => u.username === user && u.password === pass);
    
    if (!found) {
        Nexus.toast('Invalid credentials');
        return;
    }
    
    Storage.setUser({ id: found.id, username: found.username });
    Nexus.state.user = { id: found.id, username: found.username };
    Nexus.loadAllData();
    Nexus.setBg(Nexus.state.wallpaper);
    Nexus.toast('Welcome back, ' + found.name);
    Nexus.navigate('social');
};