const mongoose = require('mongoose');

const plantioSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  dataPlantio: { type: Date, required: true },
  dataColheita: { type: Date, required: true },
  thumbnail: { type: String, required: true },
  daysLeft: { type: Number, required: true },
  requiredCredits: { type: Number, required: true } // Minimum credits required to redeem
});

module.exports = mongoose.model('Plantio', plantioSchema);
