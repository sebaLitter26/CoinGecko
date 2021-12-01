const {Criptomoneda, Usuario} = require('../models');
const CoinGecko = require('../helpers');

// ==========================================
// Obtener todos los Criptomonedas
// ==========================================
const criptomonedasGet = async(req = request, res = response) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = {};

    const [ total, Criptomonedas ] = await Promise.all([
        Criptomoneda.count(query),
        Criptomoneda.find(query)
            .skip( Number( desde ) )
            .limit(Number( limite ))
            .populate('usuario', 'nombre email')
    ]);

    res.status(200).json({
        ok: true,
        Criptomonedas,
        total
    });

}

// ==========================================
//  Obtener Criptomoneda por ID
// ==========================================
const obtenerCriptomoneda = async(req, res = response ) => {

    const { id } = req.params;

    Criptomoneda.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, Criptomoneda) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Criptomoneda',
                    errors: err
                });
            }

            if (!criptomoneda) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'La criptomoneda con el id ' + id + 'no existe',
                    errors: { message: 'No existe una criptomoneda con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                criptomoneda
            });
        });
}





// ==========================================
// Actualizar Criptomoneda
// ==========================================
const actualizarCriptomoneda = async( req, res = response ) => {
    const { id } = req.params;
    const { nombre, ...data } = req.body;

    data.nombre = nombre.toUpperCase();
    data.usuario = req.usuario.uid;
    console.log(data);

    Criptomoneda.findByIdAndUpdate(id, data, (err, CriptomonedaActualizada) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Criptomoneda',
                errors: err
            });
        }

        if (!CriptomonedaActualizada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Criptomoneda con el id ' + id + ' no existe',
                errors: { message: 'No existe un Criptomoneda con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            criptomoneda: CriptomonedaActualizada
        });

    });

}



// ==========================================
// Crear un nuevo Criptomoneda
// ==========================================
const crearCriptomoneda = async(req, res = response ) => {

    const { nombre, img } = req.body;

    const newCriptomoneda = new Criptomoneda({
        nombre: nombre.toUpperCase(),
        img: img,
        usuario: req.usuario.uid
    });

    newCriptomoneda.save((err, nuevaCriptomoneda) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error al crear el Criptomoneda ${nombre}`,
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            criptomoneda: nuevaCriptomoneda
        });


    });

}


// ============================================
//   Borrar un Criptomoneda por el id
// ============================================
const criptomonedaDelete = async(req, res = response) => {

    const { id } = req.params;

    Criptomoneda.findByIdAndRemove(id, (err, criptomonedaBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar Criptomoneda',
                errors: err
            });
        }

        if (!criptomonedaBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe un Criptomoneda con el id ${id}`,
                errors: { message: `No existe un Criptomoneda con el id ${id}` }
            });
        }

        res.status(200).json({
            ok: true,
            Criptomoneda: criptomonedaBorrado
        });

    });

}

const addDivisa = async (req, res) => {
	const { name } = req.body;
	const api = new CoinGecko();
	try {
		const coin = await api.getCoinByName(name);
		if (!coin) {
			return res.status(404).json({ message: 'La criptomoneda no existe.' });
		}
		const userId = req.userId;
		const coinDetail = await api.getCoinById(coin.id);
        const foundUser = await Usuario.findById(userId);
		if (foundUser) {
			const data = {
                nombre: coinDetail.name,
                id: coin.id,
				usuario: mongoose.Types.ObjectId(userId),
				simbolo: coinDetail.symbol,
				precio: coinDetail.market_data.current_price[foundUser.monedaFavorita],
				imagen: coinDetail.image.large,
				lastUpdated: coinDetail.last_updated,
            };
			const currency = new Criptomoneda(data);
            const foundCurency = await Criptomoneda.find({ nombre: name, usuario:data.usuario });
			if (foundCurency.length > 0) {
				return res
					.status(409)
					.json({ message: 'La criptomoneda ya se encuentra agregada a su lista.' });
			}
			foundUser.currencies.push(currency);
			await currency.save();
			await foundUser.save();
			return res.status(200).json({
				message: 'Nueva Criptomoneda agregada correctamente',
			});
		} else {
			return res.status(404).json({
				message: 'Sin permisos, Usuario no encontrado',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: 'Error al agregar la Criptomoneda' });
	}
};

const getAllCriptomonedas = async (req, res) => {
	let page = req.query.page || 1;
	let per_page = req.query.per_page || 100;
	per_page = per_page > 250 ? 250 : per_page;

	const userId = req.userId;
	try {
		const favoriteCurrency = await Usuario.findById(userId).select('monedaFavorita');
		const options = {
			page,
			per_page,
			vs_currency: favoriteCurrency.favoriteCurrency,
		};
		const coinGeckoAPI = new CoinGecko();
		const markets = await coinGeckoAPI.getList(options);
		return res.status(200).json({
			markets: markets.map((market) => {
				return {
					simbolo: market.symbol,
					precio: market.current_price,
					nombre: market.name,
					imagen: market.image,
					lastUpdated: market.last_updated,
				};
			}),
		});
	} catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: 'Algo salio mal al solicitar las Criptodivisas.'
    })
  }
};

const getTopN = async (req, res) => {
	const userId = req.userId;
	const order =
		req.query.order === 'asc' ? 'current_price' : req.query.order === 'desc' ? '-current_price' : '-current_price';
	const coinGeckoAPI = new CoinGecko();
	const n = req.query.n || 25;
	if (n > 25) {
		return res.status(400).json({ message: 'No puede ser mayor a 25' });
	}
	try {
		const foundUser = await Usuario.findById(userId).populate({ path: 'criptomonedas', options: { sort: order, limit: n } });
		if (foundUser) {
			const cryptocurrencies = foundUser.criptomonedas;
			const ids = cryptocurrencies.map((currency) => currency.id).join(',');
			const currencies = 'usd,ars,clp';
			const options = { ids: ids, vs_currencies: currencies };
			const prices = await coinGeckoAPI.getPriceByCurrencies(options);
			const returnedTop = cryptocurrencies.map((cryptocurrency) => {
				return {
					simbolo: cryptocurrency.symbol,
					precios: prices[cryptocurrency.id],
					nombre: cryptocurrency.name,
					imagen: cryptocurrency.image,
					lastUpdated: cryptocurrency.last_updated,
				};
			});
			return res.status(200).json({ top: returnedTop });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: 'Algo salio mal al solicitar las Criptodivisas.' });
	}
};


const getByDate = async (req, res) => {
	const userId = req.userId;
	const start = new Date(req.query.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.query.to);
    end.setHours(23, 59, 59, 999);
    if (!start || !end) {
		return res.status(400).json({ message: 'fechas de busqueda indefinidas' });
	}
    const filterDates = {
        'lastUpdated' : {
            $gte:start,
            $lte:end
        }
    }
	const coinGeckoAPI = new CoinGecko();

	try {
		const foundUser = await Usuario.findById(userId).populate({ path: 'criptomonedas', match: filterDates });
		if (foundUser) {
			const cryptocurrencies = foundUser.criptomonedas;
			const ids = cryptocurrencies.map((currency) => currency.id).join(',');
			const currencies = 'usd,ars,clp';
			const options = { ids: ids, vs_currencies: currencies };
			const prices = await coinGeckoAPI.getPriceByCurrencies(options);
			const returnedByDates = cryptocurrencies.map((cryptocurrency) => {
				return {
					simbolo: cryptocurrency.symbol,
					precios: prices[cryptocurrency.id],
					nombre: cryptocurrency.name,
					imagen: cryptocurrency.image,
					lastUpdated: cryptocurrency.last_updated,
				};
			});
			return res.status(200).json({ byDate: returnedByDates });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: 'Algo salio mal al solicitar las Criptodivisas.' });
	}
};


module.exports = {
    criptomonedasGet,
    obtenerCriptomoneda,
    crearCriptomoneda,
    actualizarCriptomoneda,
    criptomonedaDelete,
    addDivisa,
    getAllCriptomonedas,
    getTopN,
    getByDate
}