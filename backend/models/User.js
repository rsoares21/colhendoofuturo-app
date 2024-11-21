const mongoose = require('mongoose');

// Definindo o schema do usuário
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Garante que o email seja único
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false, // Indica se o email foi verificado
  },
  lastVerificationEmailSent: {
    type: Date, // Armazenará a data do último envio do e-mail de verificação
    default: null,
  },
  roles: {
    type: [String],
    default: ['USER'], // Define a role padrão como "USER"
  },
  credits: {
    type: Number,
    default: 10, // Initialize with 10 credits
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Criando o modelo de usuário e especificando a coleção 'colhendoofuturo'
const User = mongoose.model('User', userSchema);

module.exports = User;
