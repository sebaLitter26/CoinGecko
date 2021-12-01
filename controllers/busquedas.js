
const {Criptomoneda, Usuario} = require('../models');

// ==============================
// Busqueda por colección
// ==============================
const busquedaColeccion = async(req, res = response) => {

    const { busqueda, tabla }  = req.params;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'criptomonedas':
            promesa = buscarCriptomonedas(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios y criptomonedas',
                error: { message: 'Tipo de tabla/coleccion no válido' }
            });

    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    })

}


// ==============================
// Busqueda general
// ==============================
const busquedaGeneral = async(req, res = response) => {


    const busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarCriptomonedas(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                criptomonedas: respuestas[0],
                usuarios: respuestas[1]
            });
        })


}


function buscarCriptomonedas(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Criptomoneda.find({ nombre: regex })
            .populate('usuario', 'nombre username')
            .exec((err, criptomonedas) => {

                if (err) {
                    reject('Error al cargar criptomonedas', err);
                } else {
                    resolve(criptomonedas)
                }
            });
    });
}



function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre username role')
            .or([{ 'nombre': regex }, { 'username': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }


            })


    });
}

module.exports = {
    busquedaGeneral,
    busquedaColeccion
};