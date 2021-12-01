const { check } = require('express-validator');
const { Router } = require('express');
const router = Router();

const {
    renuevaToken,
    autenticacion
} = require('../controllers/login');

    
const {
    validarCampos,
    verificaToken,
    esAdminRole,
    tieneRole,
    verificaADMIN_o_MismoUsuario
} = require('../middlewares');


// ==========================================
//  Renueva Autenticación
// ==========================================
router.get('/renuevatoken', [verificaToken], renuevaToken);

// ==========================================
//  Autenticación normal
// ==========================================
router.post('/', [
    check('email', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], autenticacion);


module.exports = router;