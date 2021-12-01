const { Router } = require('express');
const router = Router();
const { check } = require('express-validator');

const {
    validarCampos,
    verificaToken,
    esAdminRole,
    tieneRole,
    verificaADMIN_o_MismoUsuario
} = require('../middlewares');


const { esRoleValido, emailExiste, existeUsuarioPorId } = require('../helpers/db-validators');

const { criptomonedasGet,
    obtenerCriptomoneda,
    crearCriptomoneda,
    actualizarCriptomoneda,
    criptomonedaDelete,
    getTopN,
    addDivisa,
    getAllCriptomonedas,
    getByDate
 } = require('../controllers/criptomonedas');

// ==========================================
// Obtener todas las criptomonedas al valor de su moneda favorita paginado
// ==========================================
router.get('/getAllCriptomonedas', verificaToken, getAllCriptomonedas);

// ==========================================
// Obtener top N criptomonedas
// ==========================================
router.get('/getTop', verificaToken, getTopN);

// ==========================================
// Agregar criptomonedas al Usuario
// ==========================================
router.post('/addDivisa', [
    verificaToken , 
    validarCampos,
    verificaADMIN_o_MismoUsuario
], addDivisa);

// ==========================================
// Agregar criptomonedas al Usuario
// ==========================================
router.post('/getByDate', [
    verificaToken,
    verificaADMIN_o_MismoUsuario
], getByDate);


// ==========================================
//  Obtener Criptomoneda por ID
// ==========================================
router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
], obtenerCriptomoneda);


// ==========================================
// Actualizar Criptomoneda
// ==========================================
router.put('/:id', [
    verificaToken, 
    esAdminRole, 
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], actualizarCriptomoneda);



// ==========================================
// Crear un nuevo Criptomoneda
// ==========================================
router.post('/', [
    verificaToken, 
    esAdminRole,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], crearCriptomoneda);


// ============================================
//   Borrar un Criptomoneda por el id
// ============================================
router.delete('/:id', [
    verificaToken, 
    esAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], criptomonedaDelete);


module.exports = router;