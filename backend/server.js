const express = require('express');
const path = require('path');  // Para lidar com caminhos de arquivos
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');  // Importando JWT
require('dotenv').config();
const port = 5000;

const app = express();

// Importar o modelo de usuário
const User = require('./models/User'); // Agora importamos o modelo de usuário

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Body Parser
app.use(bodyParser.json());
app.use(cors());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.log('Erro de conexão:', err));

// Configuração do Nodemailer para usar o seu servidor SMTP
const transporter = nodemailer.createTransport({
    host: 'colhendoofuturo.com', // Endereço do servidor SMTP
    port: 465, // Porta do servidor (use 465 se for SSL)
    secure: true, // Se você estiver usando TLS, defina como false
    auth: {
      user: process.env.SMTP_USER, // Usuário do seu servidor SMTP
      pass: process.env.SMTP_PASS, // Senha do seu servidor SMTP
    },
  });

// Rota de registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o email já está registrado
    const existingUser = await User.findOne({ email });
    console.log('existingUser:', existingUser);
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está registrado!' });
    }

    // Cria um novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      verified: false, // Definindo que o email não foi verificado
    });

    console.log("Tentando salvar o usuário:", newUser); // Adicionando log para debug
    await newUser.save();
    console.log("Usuário salvo com sucesso!");
    // Envio do e-mail de verificação
    const verificationLink = `${process.env.BASE_URL}/verify-email/${newUser._id}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verificação de Email',
      text: `Clique no link para verificar seu e-mail: ${verificationLink}`,
    };

    // Enviar e-mail de verificação
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Erro ao enviar e-mail:', error);
        return res.status(500).json({ message: 'Erro ao enviar e-mail de verificação.' });
      }
      console.log('Email enviado: ' + info.response);
    });

    // Atualizar o campo lastVerificationEmailSent no banco de dados
    newUser.lastVerificationEmailSent = new Date(); // Preenche com a data e hora atual
    await newUser.save();  // Salva a atualização no banco

    res.status(201).json({ message: 'Cadastro realizado com sucesso! Verifique seu email.' });
  } catch (error) {
    console.error('Erro ao registrar o usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar o usuário.' });
  }
});

// Rota para verificar o email
app.get('/verify-email/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  // Atualiza o status de verificação
  user.verified = true;
  await user.save();

  res.status(200).json({ message: 'Email verificado com sucesso! Agora você pode fazer login.' });
});

// Rota de login com geração de JWT
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas!' });
    }

    // Verifica se o email foi verificado
    if (!user.verified) {
      return res.status(400).json({ message: 'Por favor, verifique seu email antes de fazer login.' });
    }

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas!' });
    }

    // Gera o JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // A chave secreta do JWT
      { expiresIn: '1h' } // O token vai expirar em 1 hora
    );

    // Sucesso no login, retorna o token JWT
    res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Middleware para proteger rotas privadas com JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso não autorizado!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido!' });
    }
    req.user = user;
    next();
  });
};

// Exemplo de uma rota protegida
app.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  res.status(200).json({ user });
});

// Rota para reenviar o e-mail de verificação
app.post('/resend-verification-email', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Verifica se o usuário existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
  
      // Verifica se o usuário já verificou o e-mail
      if (user.verified) {
        return res.status(400).json({ message: 'Seu e-mail já foi verificado.' });
      }
  
      // Verifica o tempo do último envio
      const now = new Date();
      const lastSent = user.lastVerificationEmailSent;
      const timeElapsed = (now - lastSent) / 1000; // Tempo em segundos
  
      if (timeElapsed < 60) {
        // Se não se passou 1 minuto, informa o tempo restante
        const timeRemaining = 60 - Math.floor(timeElapsed);
        return res.status(400).json({ message: `Você pode reenviar o e-mail de verificação em ${timeRemaining} segundos.` });
      }
  
      // Enviar o e-mail de verificação (aqui você pode usar sua lógica de envio)
      const verificationUrl = `${process.env.BASE_URL}/verify-email/${newUser._id}`;
  
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Verifique seu e-mail',
        text: `Por favor, clique no link para verificar seu e-mail: ${verificationUrl}`
      };
  
      await transporter.sendMail(mailOptions);
  
      // Atualiza o campo 'lastVerificationEmailSent' para o horário atual
      user.lastVerificationEmailSent = now;
      await user.save();
  
      res.status(200).json({ message: 'E-mail de verificação reenviado com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao reenviar o e-mail de verificação.' });
    }
  });

// Rota para validar a assinatura do token
app.post('/validate-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido.' });
    }
    res.status(200).json({ message: 'Token válido.', decoded });
  });
});

// Rota para servir a página protegida
app.get('/home.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Iniciar o servidor na porta 5000
app.listen(port, () => console.log(`Backend rodando na porta ${port}`));
