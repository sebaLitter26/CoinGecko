require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const { createServer } = require('http');


const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app    = express();
        this.port   = process.env.PORT;
        this.server = createServer( this.app );

        this.paths = {
            login:          '/login',
            busqueda:       '/busqueda',
            criptomoneda:   '/criptomoneda',
            usuario:        '/usuario',
            upload:         '/upload',
            img:            '/img',
        }


        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

      

    }

    async conectarDB() {
        await dbConnection();
    }


    middlewares() {

        // CORS
        this.app.use( cors({credentials: true}) );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );

        const hour = 3600000;

        //Session
        this.app.use(session({
            key: 'session',
            secret: process.env.SECRETORPRIVATEKEY, 
            resave: true, // investigar mas -> https://www.npmjs.com/package/express-session 
            saveUninitialized: true, 
            store: MongoStore.create({ mongoUrl: process.env.MONGODB_CNN }),
            maxAge: hour,
            cookie  : { maxAge : hour }
        }));

        // Fileupload - Carga de archivos
        this.app.use( fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

    }

    routes() {

        this.app.use(this.paths.usuario, require('../routes/usuario'));
        this.app.use(this.paths.criptomoneda, require('../routes/criptomoneda'));
        this.app.use(this.paths.login, require('../routes/login'));
        this.app.use(this.paths.busqueda, require('../routes/busqueda'));
        this.app.use(this.paths.upload, require('../routes/upload'));
        this.app.use(this.paths.img, require('../routes/imagenes'));

        this.app.use('/', require('../routes/app'));
        

    }

    listen() {
        this.app.listen( this.port, () => {
            console.log(`Express server puerto ${this.port}: \x1b[32m%s\x1b[0m`, 'online');
        });
    }

}

module.exports = Server;