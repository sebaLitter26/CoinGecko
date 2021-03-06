const { Router } = require('express');
const router = Router();

// var fileUpload = require('express-fileupload');
const fs = require('fs');


const {Usuario, Criptomoneda } = require('../models');


// default options
// router.use(fileUpload());




router.put('/:tipo/:id', (req, res, next) => {

    const { tipo, id } = req.params;

    // tipos de colección
    var tiposValidos = ['criptomoneda', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // 12312312312-123.png
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });


    })



});



function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }


            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err => {
                    if (err) console.log(err);
                    else console.log(`\nDeleted image: ${pathViejo}`);
                  })
                );
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })


        });

    }


    if (tipo === 'criptomonedas') {

        Empresa.findById(id, (err, empresa) => {

            if (!empresa) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'criptomoneda no existe',
                    errors: { message: 'criptomoneda no existe' }
                });
            }

            var pathViejo = './uploads/criptomonedas/' + criptomoneda.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err => {
                    if (err) console.log(err);
                    else console.log(`\nDeleted image: ${pathViejo}`);
                  })
                );
            }

            criptomoneda.img = nombreArchivo;

            criptomoneda.save((err, criptomonedaActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de la criptomoneda actualizada',
                    criptomoneda: criptomonedaActualizado
                });

            })

        });
    }


}



module.exports = router;