/* ============================================================
   CONTENIDO DEL CAMPUS — este es el único archivo que hay que editar
   para cambiar textos, cursos, módulos y actividades.

   Reglas rápidas:
   - Cada texto va entre comillas "..." o `...` (las comillas invertidas
     permiten varias líneas y HTML simple: <p>, <b>, <ul><li>, <a href>).
   - Después de cada elemento de una lista va una coma.
   - Los "id" no se cambian una vez publicado (se usan para guardar el progreso).
   - Tipos de lección: "texto", "video", "recurso", "quiz", "pregunta".
   ============================================================ */

window.CAMPUS = {
  config: {
    nombre: "Campus Abierto EMPUJAR",
    bajada: "Recursos gratuitos para prepararte para el mundo del trabajo, a tu ritmo y cuando quieras.",
    organizacion: "Fundación EMPUJAR",
    // Firma que aparece en el certificado
    firmaNombre: "Equipo de Selección y Admisión",
    firmaCargo: "Fundación EMPUJAR",
    contacto: "https://www.fundacionempujar.org",

    /* REGISTRO (FormAssembly → Salesforce). Ver LEEME.md, paso 3.
       urlFormulario: link público del formulario de registro en FormAssembly.
       Si queda vacío, el campus funciona en MODO PRUEBA (registro local, no envía datos). */
    registro: {
      urlFormulario: "",
      // Parámetros extra para precargar campos ocultos (ej. origen del lead). Opcional.
      precarga: "" // ej: "tfa_20=Campus%20Abierto"
    },

    /* FINALIZACIÓN DE CURSO (opcional, FormAssembly → Salesforce).
       Al terminar un curso, el botón "Avisar a EMPUJAR que terminé" abre este formulario
       con los datos ya completados. En "campos" va el alias (tfa_...) de cada campo. */
    finalizacion: {
      urlFormulario: "",
      campos: {
        email: "tfa_1",
        nombre: "tfa_2",
        curso: "tfa_3",
        codigo: "tfa_4",
        respuestas: "tfa_5"
      }
    },

    // Texto que se muestra en el registro de prueba
    textoConsentimiento:
      "Acepto que la Fundación EMPUJAR guarde mis datos para contactarme sobre sus programas."
  },

  cursos: [
    {
      id: "busqueda-laboral",
      titulo: "Herramientas para tu búsqueda laboral",
      descripcion: "Armá tu CV, prepará una entrevista y organizá tu búsqueda con un plan semanal.",
      duracion: "40 min",
      color: "#2F6FDE",
      modulos: [
        {
          id: "cv",
          titulo: "Tu CV",
          lecciones: [
            {
              id: "cv-intro",
              tipo: "texto",
              titulo: "¿Para qué sirve un CV?",
              contenido: `
                <p>Tu CV es la primera impresión que una empresa tiene de vos. No tiene que contar toda tu vida: tiene que mostrar, en una página, por qué podés hacer bien el trabajo.</p>
                <ul>
                  <li><b>Datos de contacto</b> claros: teléfono y mail que revises seguido.</li>
                  <li><b>Experiencia</b>: también cuentan changas, voluntariados y trabajos informales.</li>
                  <li><b>Formación</b>: lo último que estudiaste primero.</li>
                  <li><b>Habilidades</b>: concretas, no adjetivos.</li>
                </ul>`
            },
            {
              id: "cv-video",
              tipo: "video",
              titulo: "Video: cómo armar tu CV paso a paso",
              // Pegá el link de YouTube (puede ser "no listado")
              youtube: "https://www.youtube.com/watch?v=VIDEO_DE_EJEMPLO",
              contenido: "<p>Mirá el video y después pasá a la próxima actividad.</p>"
            },
            {
              id: "cv-plantilla",
              tipo: "recurso",
              titulo: "Plantilla de CV para descargar",
              contenido: "<p>Descargá la plantilla, completala y guardala en PDF.</p>",
              url: "https://drive.google.com/",
              textoBoton: "Abrir plantilla"
            },
            {
              id: "cv-quiz",
              tipo: "quiz",
              titulo: "Repaso: ¿qué va en un CV?",
              aprobar: 2, // respuestas correctas necesarias para aprobar
              preguntas: [
                {
                  texto: "¿Cuál es el largo recomendado para un primer CV?",
                  opciones: ["Una página", "Tres páginas", "Lo más largo posible"],
                  correcta: 0,
                  explicacion: "Una página alcanza y se lee completa."
                },
                {
                  texto: "Hiciste changas de pintura durante un año. ¿Las ponés?",
                  opciones: ["No, no eran un trabajo formal", "Sí, como experiencia"],
                  correcta: 1,
                  explicacion: "Toda experiencia muestra responsabilidad y habilidades."
                },
                {
                  texto: "¿Qué mail conviene poner?",
                  opciones: ["Uno que revise seguido y con mi nombre", "Cualquiera, total no escriben"],
                  correcta: 0,
                  explicacion: "Las empresas suelen contactar por mail; tiene que ser uno que leas."
                }
              ]
            }
          ]
        },
        {
          id: "entrevista",
          titulo: "La entrevista",
          lecciones: [
            {
              id: "entrevista-claves",
              tipo: "texto",
              titulo: "Cinco claves para la entrevista",
              contenido: `
                <ol>
                  <li>Averiguá qué hace la empresa antes de ir.</li>
                  <li>Llegá 10 minutos antes (o conectate antes si es virtual).</li>
                  <li>Prepará un ejemplo concreto de algo que resolviste.</li>
                  <li>Escuchá la pregunta completa antes de responder.</li>
                  <li>Llevá una pregunta para hacerles a ellos.</li>
                </ol>`
            },
            {
              id: "entrevista-pregunta",
              tipo: "pregunta",
              titulo: "Practicá tu respuesta",
              contenido: "<p>Una de las preguntas más comunes es: <b>«Contame sobre vos»</b>. Escribí cómo la responderías en 4 o 5 oraciones.</p>",
              minimo: 60 // caracteres mínimos
            }
          ]
        },
        {
          id: "plan",
          titulo: "Tu plan de búsqueda",
          lecciones: [
            {
              id: "plan-semanal",
              tipo: "texto",
              titulo: "Organizá tu semana",
              contenido: `
                <p>Buscar trabajo es un trabajo. Un plan simple ayuda a sostenerlo:</p>
                <ul>
                  <li><b>Lunes:</b> revisar portales y anotar avisos.</li>
                  <li><b>Martes y miércoles:</b> postularte y adaptar el CV.</li>
                  <li><b>Jueves:</b> contactar conocidos que puedan recomendarte.</li>
                  <li><b>Viernes:</b> revisar qué funcionó y ajustar.</li>
                </ul>`
            },
            {
              id: "plan-autoeval",
              tipo: "quiz",
              titulo: "Autoevaluación final",
              aprobar: 2,
              preguntas: [
                {
                  texto: "¿Qué conviene hacer antes de una entrevista?",
                  opciones: ["Averiguar sobre la empresa", "Nada, improvisar es mejor"],
                  correcta: 0,
                  explicacion: "Conocer la empresa te da seguridad y mejores respuestas."
                },
                {
                  texto: "¿Cada cuánto conviene revisar tu plan de búsqueda?",
                  opciones: ["Una vez por semana", "Nunca"],
                  correcta: 0,
                  explicacion: "Revisar seguido te permite ajustar lo que no funciona."
                }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "conoce-empujar",
      titulo: "Conocé EMPUJAR",
      descripcion: "Qué hacemos, cómo funcionan nuestros programas y cómo podés sumarte.",
      duracion: "15 min",
      color: "#E07A1F",
      modulos: [
        {
          id: "quienes-somos",
          titulo: "Quiénes somos",
          lecciones: [
            {
              id: "qs-texto",
              tipo: "texto",
              titulo: "La Fundación",
              contenido: `
                <p><i>Texto de ejemplo: reemplazar con la presentación institucional.</i></p>
                <p>En EMPUJAR acompañamos a jóvenes en su camino hacia el primer empleo formal.</p>`
            },
            {
              id: "qs-programa",
              tipo: "texto",
              titulo: "Nuestros programas",
              contenido: `
                <p><i>Texto de ejemplo: describir cada programa, requisitos y fechas de inscripción.</i></p>`
            },
            {
              id: "qs-interes",
              tipo: "pregunta",
              titulo: "Contanos qué estás buscando",
              contenido: "<p>¿Qué te gustaría lograr en los próximos meses? Lo leemos para orientarte mejor.</p>",
              minimo: 20
            }
          ]
        }
      ]
    }
  ]
};
