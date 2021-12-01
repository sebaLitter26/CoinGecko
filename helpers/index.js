const dbValidators = require('./db-validators');
const generarJWT   = require('./generar-jwt');
const coinGecko = require('./coingecko');
const subirArchivo = require('./subir-archivo');


module.exports = {
	...dbValidators,
    ...generarJWT,
    ...coinGecko,
    ...subirArchivo,
}