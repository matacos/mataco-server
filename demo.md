# Demo

0. Restaurar el estado de la base de datos de 2018-12-03 10:23:53 +0000

1. Se pone la fecha al princípio de la inscripción a cursadas **Correr presentacion/tiempo_inscripcion.sh**
2. 97452 se inscribe en algoritmos 3 a través de la app
3. Se pone la fecha al finalizar la cursada **Correr presentacion/epoca_finales.sh**
4. Se aprueba al usuario desde el front-end (12345678 - font)
5. En android aparece la encuesta, se la completa, y **se llena el comentario**
6. Se muestra el reporte de encuestas entrando por el administrador de departamento (12345678 - font). Mostrar que figura el comentario que hicimos recién.

## Problemas y soluciones

 - "Error de conexión" y H18 en heroku logs: entrar a elephantsql con bash browse-remote-postgres.sh
 - No aparecen los cuatris al momento de hacer el reporte: Ir al otro reporte y aparecen los cuatris. Después, volver.
