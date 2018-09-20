# Desarrollando front-end

1. Correr `bash run-local-server.sh` en la carpeta raíz del repo.
2. `cd front`.
3. Correr `npm start` desde la carpeta `front`.
4. Desarrollar, al guardar los archivos, la página en el port `3030` se actualiza sola. El js, "sin querer" le habla al backend de `localhost:3000`, que es donde está corriendo el servidor real.
5. Correr `npm build`, lo cual actualiza la versión del frontend que el servidor de `localhost:3000` tiene.
6. La carpeta "build" es creada y eliminada en el proceso de build.


# Deploy, setup y tests
El archivo `setup.sql` tiene toda la información de esquemas y todo el llenado inicial de la base de datos.

El archivo `destroy.sql` tiene todos los DROP's necesarios para limpiar la base de datos. Esto es porque no sé cómo destruirla bien.

Correr `bash run-tests.sh` para correr los tests adentro de docker. Esto maneja `docker-compose` y `docker` internamente. La carpeta "test" es una imagen de docker que no comparte nada de código con la app, y que se comunica con la imagen "app" por dentro de `docker-compose`, al ejecutar los tests con `run-tests.sh`. El archivo `run-tests.sh` termina con código 0 en caso de que los tests pasen, y con código 1 de lo contrario. Este es el comando que se corre en travis.

Correr `run-deploy.sh` realiza el deploy a heroku, **pero no modifica nada de la base de datos**.
Correr `run-setup-db.sh` **reestablece la base de datos**, corriendo `destroy.sql` y `setup.sql`, al igual que se hace en la imagen docker.

Para probar la aplicación localmente hay que correr `bash run-local-server.sh`, lo cual hace que la aplicación se corra en un ambiente similar al de `run-tests.sh`, con la base de datos "reiniciada" con `setup.sql` y `destroy.sql`. También corre los tests, pero no termina el script al terminar con los test. El servidor se expone en `localhost:3000`. La base de datos se expone en `localhost:5444`, se puede entrar a la base de datos dockerizada con `psql` (no me acuerdo las opciones) (por si quieren tocar los datos así).

# Implementación
Se usará passport para manejar login, bearer
https://github.com/passport/express-4.x-http-bearer-example/tree/master/db
Se usará ajv para validar el json del cuerpo del request
https://github.com/epoberezkin/ajv

# Diagrama entidad relación

![Diagrama de la base de datos](https://github.com/matacos/mataco-server/raw/master/bdd.png)

Para editarlo: https://www.draw.io/#Hmatacos%2Fmataco-server%2Fmaster%2Fbdd.png

# API

## /users
```
{
    "username":"97452",
    "password":"esoj",
    "email":"jose.sbru@....",
    "rol":"estudiante"
}
```
Representa un usuario del sistema. Este endpoint se usa para ver el tema de roles y permisos, y para editar datos de 
### PUT /users/<username>
Editar los datos de un usuario.
Permisos: Sólo puede correrlo <username>, a menos que el usuario sea administrador. Se ignora el campo username. Se ignora el campo "rol", excepto para el administrador.
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
/users?roles=estudiante,docente
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


## /cursadas
### GET /cursadas y GET /cursadas/<id>
**También conocido como:** `GET /cursadas/inscripcion/<id>`
**También conocido como:** `GET /cursadas/<id materia>/inscriptos<id>`
```
Estudiante=User + carreras
```

```
Cursada
{
    "estudiante":<Estudiante>,
    "curso":<Curso>,
    "id":<id cursada>,
    "fecha-alta":<fecha UTC del alta de cursada>,
    "aceptada":true/false,
    "nota":<-1 indica que no fue rendida, 3 o menos indica desaprobada, 4 o más indica aprobada>,
    "fecha_nota":<fecha UTC en que se colocó la nota de cursada>,
}
```
Querys soportadas:
```
/cursadas?estudiante=97452
/cursadas?aceptada=true
/cursadas?con_nota=true
/users?skip=n [default 0]
/users?first=n [default 10]
```

/cursadas devuelve:
```
{
    cursadas:[
        array de Cursada
    ],
    "total":<cantidad de usuarios totales para ese filtro>,
    "token":<próximo token>
}
/cursadas devuelve una Cursada y un token.
```
Permisos: 
 - Puede llamarlo el estudiante, lo cual filtra, permitiendole acceder solamente a sus cursadas. 
 - Puede llamarlo el docente, siempre que haya sido asignado a un curso que lo tenga a él.

### POST /cursadas
**También conocido como:** POST /cursadas/inscripcion
Recibe:
```
{
    "estudiante":<username>,
    "curso":<id-curso>,
}
```
Permisos: 
 - Puede llamarlo el estudiante, permitiendo hacer alta sólo para sí mismo.
 - Puede llamarlo el docente, siempre que haya sido asignado a un curso que lo tenga a él.

### PUT /cursadas/<id cursada>
```
{
    "aceptada":true/false, (campo opcional)
    "nota":<-1 indica que no fue rendida, 3 o menos indica desaprobada, 4 o más indica aprobada>, (campo opcional)
    "fecha_nota":<fecha UTC en que se colocó la nota de cursada>,(campo opcional)
}
```

Sólo se permite colocar notas en cursadas que fueron aceptadas.
Permisos: Sólo puede llamarlo un docente asignado a un curso vinculado a esta cursada

### DELETE /cursadas/<id cursada>
**También conocido como:** DELETE `/cursadas/inscripcion/<id cursada>`

Permisos: Sólo puede llamarlo un alumno (se desinscribe)

## /materias
### GET /materias
permisos: público
```
{
    "materias":[
        {
            "id":"id de la materia",
            "nombre":"nombre de materia",
            "codigo":"código de la materia",(código dentro de depto)
            "departamento":<código de depto>,
            "carreras":[
                <código de carrera>
            ]
            "correlativas":[
                <id de las correlativas>
            ]
        },
        ...
    ],
    "token":<próximo token>
}
```
Filtros soportados:
```
/materias?carrera=1 [sólo las que corresponden al menos para esa carrera] (lo usa el estudiante)
/materias?skip=n [default 0]
/materias?first=n [default 10]
```

## /cursos
Docente= User
Curso:
```
{
    "id":<id del curso>
    "materia":<id de materia>
    "vacantes_totales":<cantidad de vacantes>,
    "vacantes_restantes":<cantidad de vacantes>,
    "jefe_tp":<Docente>,
    "jefe_catedra":<Docente>,
    "ayudantes":[
        <Docente>
    ],
    "cuatri":{
        "id":<id del cuatri>,
        "fecha_inicio": timestamp UTC,
        "fecha_fin": timestamp UTC,
    }
    "horarios":[{
        "dia":"mie",
        "inicio":"18:45",
        "fin":"22:30",
        "descripcion":"texto libre"
    }]
}
```
### GET /cursos, GET /cursos/<id de curso>
Devuelve la lista de cursos. 
Permisos: es público
Filtros permitidos:
```
/cursos?materia=<materia> [devuelve los cursos de esa materia]
/cursos?dado_por=<id de docente> [devuelve los cursos de ese docente]
/cursos?skip=n [default 0]
/cursos?first=n [default 10]
```

### POST /cursos
Agregar un curso.
Recibe:
```
{
    "materia":<id de la materia>,
    "vacantes_totales":<int>,
    "jefe_tp":<id de docente>,
    "jefe_catedra":<id del docente>,
    "ayudantes":[
        <id de ayudante>
    ],
    "cuatri":<id de cuatrimestre>,
    "horarios":[{
        "dia":"mie",
        "inicio":"18:45",
        "fin":"22:30",
        "descripcion":"texto libre"
    }]
}
```
Devuelve: El Curso construído, como si viniera de un GET.
Permisos: Sólo el departamento, puede crear cursos asociados a materias de ese departamento. 

### PUT /cursos/<id de curso>
Modificar un curso.
Recibe: el mismo Json que POST.
Devuelve: el mismo Json que si viniera de un GET.
Permisos: Sólo el departamento, puede modificar cursos asociados a materias de ese departamento.

### DELETE /cursos/<id de curso>
Elimina un curso