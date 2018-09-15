# Implementación
Se usará passport para manejar login, bearer
https://github.com/passport/express-4.x-http-bearer-example/tree/master/db
Se usará ajv para validar el json del cuerpo del request
https://github.com/epoberezkin/ajv

# Diagrama entidad relación

![bdd.png](Diagrama de la base de datos)

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


## /cursadas
### GET /cursadas
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

Devuelve:
```
{
    cursadas:[
        array de Cursada
    ],
    "total":<cantidad de usuarios totales para ese filtro>,
    "token":<próximo token>
}
```
Permisos: 
 - Puede llamarlo el estudiante, lo cual filtra, permitiendole acceder solamente a sus cursadas. 
 - Puede llamarlo el profesor, siempre que haya sido asignado a un curso que lo tenga a él.

### POST /cursadas
Recibe:
```
{
    "estudiante":<username>,
    "curso":<id-curso>,
}
```
Permisos: 
 - Puede llamarlo el estudiante, permitiendo hacer alta sólo para sí mismo.
 - Puede llamarlo el profesor, siempre que haya sido asignado a un curso que lo tenga a él.

### PUT /cursadas/<id cursada>
```
{
    "aceptada":true/false, (campo opcional)
    "nota":<-1 indica que no fue rendida, 3 o menos indica desaprobada, 4 o más indica aprobada>, (campo opcional)
    "fecha_nota":<fecha UTC en que se colocó la nota de cursada>,(campo opcional)
}
```

Sólo se permite colocar notas en cursadas que fueron aceptadas.
Permisos: Sólo puede llamarlo un profesor asignado a un curso vinculado a esta cursada

### DELETE /cursadas/<id cursada>

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
Curso:
```
{
    "id":<id del curso>
    "materia":<id de materia>
    "vacantes_totales":<cantidad de vacantes>,
    "vacantes_restantes":<cantidad de vacantes>,
    "jefe_tp":<Profesor>,
    "jefe_catedra":<Profesor>,
    "ayudantes":[
        <Profesor>
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
/cursos?dado_por=<id de profesor> [devuelve los cursos de ese profesor]
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
    "jefe_tp":<id de profesor>,
    "jefe_catedra":<id del profesor>,
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





# pendientes
Estudiante = User, por ahora
Profesor = User, por ahora