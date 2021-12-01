const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const criptomonedaSchema = new Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre de la criptomoneda es necesario'], 
        unique: true 
    },
    id: {type: String, required: true},
    simbolo: { type: String, required: [true,'El simbolo de la criptomoneda es necesario'] },
    precio: { type: Number, required: [true,'El precio de la criptomoneda es necesario'] },
    imagen: { type: String, required: false },
    lastUpdated: { type: String, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'criptomonedas' });

module.exports = mongoose.model('Criptomoneda', criptomonedaSchema);