{
    poll_results:{
        q1:[
            {
                score:3.4,//este es el promedio para esa pregunta
                course:2
            }
        ],
        q2:[...],
        q3:[...],
        ...
        q7:[...],
        feedback:[
            {
                feedback:"...",
                course:2
            }
        ]
    },
    courses:{
        todos los cursos que están referenciados en el array poll_results, con el mismo formato que /cursos
    },
    subjects:{
        todas las materias referenciadas en el array courses, con el mismo formato que /cursos
    }
}