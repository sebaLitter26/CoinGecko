# Backend-Server

Este es el código necesario para establecer el backend conectado a MongoDB usando Mongoose y CoinGecko API

Para ejecutarlo, es necesario reconstruir los módulos de node usando el comando

```
npm install
npm start
```


## Dentro de las peticiones estan:
usuariosPut             Modifica un usuario. ya sea modificando la moneda Favorita, nombre, apellido, role
-------
usuariosPost            Crear un usuario
-------
addDivisa               Agregar divisas al usuario.
-------
getAllCriptomonedas     Obtener todas las criptomonedas al valor de su moneda favorita paginado
-------
getTopN                 Obtener top N criptomonedas
-------
getByDate               Obtener criptomonedas por Fechas (from y to) 

    Por dia: from y to iguales.
    por mes: from dia 1, to ultimo dia de ese mes.
    De lo contrario se buscara por el rango de fechas estipulado.