const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};


const UsuarioSchema = new mongoose.Schema({

    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    apellido: { type: String, required: [true, 'El apellido es necesario'] },
    username: { type: String, unique: true, required: [true, 'El username es necesario'] },
    password: { type: String, min:8, required: [true, 'La contraseña es necesaria'] },
    //img: { type: String, required: false },
    estado: { type: Boolean, default: true },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    monedaFavorita: {type: String, enum : ['usd','ars','clp'], default: 'usd', required: [true, 'La moneda es necesaria'] },
    criptomonedas : [{ type: Schema.Types.ObjectId, ref:'Criptomoneda'}]
});

UsuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

UsuarioSchema.methods.toJSON = function() {
    const { __v, password, _id, ...usuario  } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports = mongoose.model('Usuario', UsuarioSchema);