const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');


/*PARA RODAR O MOCK SERVER: npm run server */


// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read users
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

// Helper function to write users
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    try {
        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
            console.log('Body:', JSON.stringify(req.body, null, 2));
        }
    } catch (e) {
        // Silently fail logging if body is problematic
    }
    next();
});

// Implementation of routes
app.post('/auth/register', (req, res) => {
    const { email, senha, name } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Usuário já existe.' });
    }

    const newUser = { email, senha, name: name || 'Usuário Mock' };
    users.push(newUser);
    writeUsers(users);

    console.log('--- Novo usuário registrado ---');
    console.log(`Email: ${email}`);

    res.status(201).json({ message: 'Usuário registrado com sucesso!', user: { email, name: newUser.name } });
});

app.post('/auth/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email && u.senha === senha);

    if (!user) {
        return res.status(401).json({ message: 'Email ou senha incorretos.' });
    }

    console.log('--- Login bem-sucedido ---');
    console.log(`Usuário: ${email}`);

    res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: { email: user.email, name: user.name },
        token: 'mock-jwt-token-for-testing'
    });
});

app.get('/', (req, res) => {
    res.send('Servidor Mock do Movout está rodando!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`Mock Server rodando em http://localhost:${PORT}`);
    console.log(`Para acesso via emulador Android, use: http://10.0.2.2:${PORT}`);
    console.log(`========================================`);
});
