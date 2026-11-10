# Campus Abierto: guía de puesta en marcha

Sitio liviano y gratuito: se aloja en GitHub Pages, el registro entra a Salesforce por FormAssembly y los materiales viven en SharePoint y YouTube.

## Archivos

| Archivo | Para qué sirve | ¿Se edita? |
| --- | --- | --- |
| `contenido.js` | Cursos, módulos, lecciones, quizzes y configuración | Sí, es el único |
| `styles.css` | Colores y tipografía (variables al principio) | Solo para aplicar la identidad visual |
| `app.js` | Funcionamiento del campus | No |
| `index.html` | Página principal | No |

Para probarlo, abrí `index.html` con doble clic. Sin FormAssembly configurado funciona en **modo prueba**: el registro queda solo en ese navegador.

## 1. Cargar contenido

Abrí `contenido.js` con un editor de texto (por ejemplo, Bloc de notas o VS Code) y seguí el formato de los ejemplos. Hay cinco tipos de lección:

- `texto`: contenido con HTML simple (`<p>`, `<b>`, `<ul><li>`).
- `video`: pegás el link de YouTube en `youtube`. Conviene subirlo como **no listado**.
- `recurso`: un botón que abre un link (PDF en SharePoint, plantilla, etc.).
- `quiz`: preguntas de opción múltiple; `correcta` es la posición de la opción correcta, contando desde 0. `aprobar` es la cantidad mínima de respuestas correctas.
- `pregunta`: respuesta abierta con un mínimo de caracteres.

Una vez publicado, no cambies los `id`: con ellos se guarda el avance de cada persona.

## 2. Publicar en GitHub Pages (gratis)

1. Creá una cuenta de GitHub institucional (por ejemplo, `fundacionempujar`).
2. Creá un repositorio público llamado `campus`.
3. Usá **Add file → Upload files** y arrastrá los archivos de esta carpeta.
4. Andá a **Settings → Pages**, elegí la rama `main` y la carpeta `/ (root)`, y guardá.
5. En uno o dos minutos el campus queda en `https://fundacionempujar.github.io/campus/`.

Para actualizar, volvé a subir `contenido.js` y GitHub publica el cambio solo. Si más adelante quieren un dominio propio (por ejemplo, `campus.fundacionempujar.org`), se configura en la misma pantalla.

## 3. Registro en FormAssembly → Salesforce

1. En FormAssembly, creá el formulario **"Registro Campus Abierto"** con los campos que pida captación: nombre, apellido, mail, celular, edad, zona, programa de interés y consentimiento. Agregá un campo oculto "Origen" con el valor `Campus Abierto`.
2. Conectalo con el Salesforce Connector, igual que los otros formularios de captación (Lead o Contact, y Campaign Member si usan campañas).
3. En **Notifications → Redirect**, poné la URL de vuelta al campus con los alias del nombre y del mail:
   ```
   https://fundacionempujar.github.io/campus/?registro=ok&nombre=%%tfa_NOMBRE%%&email=%%tfa_EMAIL%%
   ```
   Reemplazá `tfa_NOMBRE` y `tfa_EMAIL` por los alias reales. Están en Notifications → "Show the list of available aliases".
4. En `contenido.js`, pegá el link público del formulario en `registro.urlFormulario`.

Así funciona el recorrido: la persona toca "Empezar", completa el formulario de FormAssembly (los datos van a Salesforce) y vuelve sola al curso con su nombre cargado para el certificado.

## 4. Formulario de finalización (opcional, recomendado)

Sirve para saber en Salesforce quién terminó cada curso y leer sus respuestas abiertas.

1. Creá un formulario **"Finalización Campus"** con estos campos: mail, nombre, curso, código de certificado y respuestas (texto largo). Conectalo a Salesforce; por ejemplo, para actualizar el Lead por mail o el estado del Campaign Member.
2. En `contenido.js`, completá `finalizacion.urlFormulario` y los alias de cada campo en `finalizacion.campos`.

Al terminar un curso, el certificado muestra el botón **"Avisar a EMPUJAR que terminé"**, que abre ese formulario con todo precargado.

## 5. Materiales en SharePoint

- Subí los PDF y las plantillas a una biblioteca de SharePoint dedicada (por ejemplo, "Campus Abierto – Materiales").
- Compartí cada archivo con **"Cualquier persona con el vínculo" → Solo ver** y pegá ese link en `url` de la lección `recurso`.
- Si esa opción no aparece, el admin de Microsoft 365 tiene que habilitar el uso compartido externo con vínculos anónimos para ese sitio.

## Cosas para tener en cuenta

- **Avance por dispositivo:** el progreso se guarda en el navegador. Si alguien cambia de celular, vuelve a ingresar su nombre y mail ("Ya me registré") y retoma desde cero. Para un campus abierto y gratuito es un costo aceptable a cambio de no tener servidor.
- **El certificado** es una constancia de finalización. El código se genera a partir del mail y el curso, y se puede cruzar con el formulario de finalización.
- **Privacidad:** el campus no guarda datos personales en ningún servidor propio. Los datos de registro quedan solo en FormAssembly y Salesforce.
- **Identidad visual:** cambiá `--accent` y `--font` en `styles.css` según el manual de identidad de EMPUJAR, y el `color` de cada curso en `contenido.js`.
