# Implementación
Se usará passport para manejar login, bearer

https://github.com/passport/express-4.x-http-bearer-example/tree/master/db

# API

## /users
```
{
    "username":"97452",
    "password":"esoj",
    "email":"jose.sbru@....",
    "role":"estudiante"
}
```
Representa un usuario del sistema. Este endpoint se usa para ver el tema de roles y permisos, y para editar datos de 
### PUT /users/<username>
Editar los datos de un usuario.
Permisos: Sólo puede correrlo <username>, a menos que el usuario sea administrador.
Envío: Un User (token en header)
Vuelve: Ese User y un token
### POST /users
Alta de usuario.
Permisos: Sólo puede correrlo el administrador.
Envío: un User (token en header)
Vuelve: Ese User y un token
### GET /users
Devuelve todos los usuarios. Filtros permitidos:
```
/users?roles=estudiante,profesor
/users?skip=n [default 0]
/users?first=n [default 10]
```
Permisos: sólo el administrador puede correrlo
Vuelve:
```
{
    "Users":[
        <array de User>
    ],
    "total":<cantidad de usuarios totales para ese filtro>,
    "token":<próximo token>
}
```
### DELETE /users/<username>
Elimina ese usuario.
Permisos: Sólo lo corre el administrador


## /cursada
```TIENEN QUE SER DIFERENTES EL POST EL PUT Y EL GET
{
    "estudiante":<username>,
    "curso":<id-curso>,
    "id":<id cursada>,
    "fecha-alta":<fecha del alta de cursada>,
    "aceptada":true/false,
    "nota":<-1 indica que no fue rendida, 3 o menos indica desaprobada, 4 o más indica aprobada>,
    "fecha_nota":<fecha UTC en que se colocó la nota de cursada>,
    "cuatrimestre":<código del cuatrimestre al que corresponde esta cursada>
}
```