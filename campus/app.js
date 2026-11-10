/* Campus Abierto — lógica de la aplicación.
   No hace falta editar este archivo para cambiar contenido: usá contenido.js. */
(function () {
  "use strict";

  var C = window.CAMPUS;
  var CFG = C.config;
  var app = document.getElementById("app");
  var STORE_KEY = "campus-abierto.v1";
  var faRegistro = !!(CFG.registro && CFG.registro.urlFormulario);

  /* ---------- Almacenamiento (en este navegador) ---------- */
  var memoria = null;
  function cargar() {
    if (memoria) return memoria;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    memoria = d || { perfil: null, progreso: {}, respuestas: {}, pendiente: null };
    return memoria;
  }
  function guardar() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(memoria)); } catch (e) {}
  }
  var S = cargar();

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function curso(id) { return C.cursos.filter(function (c) { return c.id === id; })[0]; }
  function lecciones(c) {
    var out = [];
    c.modulos.forEach(function (m) { m.lecciones.forEach(function (l) { out.push({ mod: m, lec: l }); }); });
    return out;
  }
  function hecho(cid, lid) { return !!(S.progreso[cid] && S.progreso[cid][lid]); }
  function marcar(cid, lid) {
    S.progreso[cid] = S.progreso[cid] || {};
    S.progreso[cid][lid] = new Date().toISOString();
    guardar();
  }
  function avance(c) {
    var ls = lecciones(c), n = ls.filter(function (x) { return hecho(c.id, x.lec.id); }).length;
    return { hechas: n, total: ls.length, pct: ls.length ? Math.round((n / ls.length) * 100) : 0 };
  }
  function completo(c) { var a = avance(c); return a.total > 0 && a.hechas === a.total; }
  function fechaFin(c) {
    var p = S.progreso[c.id] || {}, max = "";
    Object.keys(p).forEach(function (k) { if (p[k] > max) max = p[k]; });
    return max ? new Date(max) : new Date();
  }
  function codigoCert(c) {
    var base = (S.perfil ? S.perfil.email : "") + "|" + c.id, h = 5381;
    for (var i = 0; i < base.length; i++) h = ((h << 5) + h + base.charCodeAt(i)) >>> 0;
    return (c.id.slice(0, 3) + "-" + h.toString(36)).toUpperCase();
  }
  function ytId(url) {
    var m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function fechaLarga(d) {
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  }

  /* ---------- Registro ---------- */
  var dlg = document.getElementById("registro");
  var form = document.getElementById("form-registro");
  var alRegistrar = null;

  function abrirDialogo(modo, cb) {
    alRegistrar = cb;
    var consent = document.getElementById("consent-row");
    if (modo === "datos") {
      document.getElementById("reg-titulo").textContent = "Tus datos para el certificado";
      document.getElementById("reg-texto").textContent = "Escribí tu nombre como querés que figure y el mismo mail con el que te registraste.";
      consent.hidden = true; consent.querySelector("input").required = false;
    } else {
      document.getElementById("reg-titulo").textContent = "Registrate para empezar";
      document.getElementById("reg-texto").textContent = "Es gratis. Lo usamos para guardar tu avance y emitir tu certificado.";
      consent.hidden = false; consent.querySelector("input").required = true;
    }
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    form.nombre.focus();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    S.perfil = { nombre: form.nombre.value.trim(), email: form.email.value.trim().toLowerCase(), desde: new Date().toISOString() };
    guardar();
    dlg.close();
    pintarUsuario();
    if (alRegistrar) { var cb = alRegistrar; alRegistrar = null; cb(); }
  });
  document.getElementById("cancelar-registro").addEventListener("click", function () { dlg.close(); });
  document.getElementById("txt-consent").textContent = CFG.textoConsentimiento || "";

  // Vuelta desde FormAssembly: index.html?registro=ok&nombre=...&email=...
  (function volverDeFormAssembly() {
    var q = new URLSearchParams(location.search);
    if (q.get("registro") !== "ok") return;
    var nombre = (q.get("nombre") || "").trim(), email = (q.get("email") || "").trim().toLowerCase();
    var destino = S.pendiente ? "#/curso/" + S.pendiente : "#/";
    S.pendiente = null;
    history.replaceState(null, "", location.pathname + destino);
    if (nombre && email && nombre.indexOf("%%") < 0) {
      S.perfil = { nombre: nombre, email: email, desde: new Date().toISOString() };
      guardar();
    } else {
      guardar();
      setTimeout(function () { abrirDialogo("datos", function () { router(); }); }, 50);
    }
  })();

  function requiereRegistro(cid, seguir) {
    if (S.perfil) return seguir();
    if (faRegistro) { location.hash = "#/registro/" + cid; return; }
    abrirDialogo("registro", seguir);
  }

  /* ---------- Vistas ---------- */
  function vistaInicio() {
    var html = '<section class="hero"><h1>' + esc(CFG.nombre) + '</h1><p>' + esc(CFG.bajada) + "</p></section>";
    html += '<section class="grid">';
    C.cursos.forEach(function (c) {
      var a = avance(c), nl = lecciones(c).length;
      var btn = a.hechas === 0 ? "Empezar" : completo(c) ? "Ver certificado" : "Continuar";
      var href = completo(c) ? "#/certificado/" + c.id : "#/curso/" + c.id;
      html += '<article class="card" style="--c:' + esc(c.color || "var(--accent)") + '">' +
        '<div class="card-band"></div><div class="card-body">' +
        "<h2>" + esc(c.titulo) + "</h2><p>" + esc(c.descripcion) + "</p>" +
        '<p class="meta">' + nl + " actividades · " + esc(c.duracion || "") + "</p>" +
        (a.hechas ? '<div class="bar" role="progressbar" aria-valuenow="' + a.pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + a.pct + '%"></span></div><p class="meta">' + a.pct + "% completado</p>" : "") +
        '<a class="btn" href="' + href + '" data-curso="' + esc(c.id) + '">' + btn + "</a></div></article>";
    });
    html += "</section>";
    app.innerHTML = html;
    app.querySelectorAll("a[data-curso]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var cid = a.getAttribute("data-curso");
        if (!S.perfil) { e.preventDefault(); requiereRegistro(cid, function () { location.hash = "#/curso/" + cid; }); }
      });
    });
  }

  function vistaRegistroFA(cid) {
    var c = curso(cid);
    S.pendiente = c ? c.id : null; guardar();
    var url = CFG.registro.urlFormulario + (CFG.registro.precarga ? (CFG.registro.urlFormulario.indexOf("?") < 0 ? "?" : "&") + CFG.registro.precarga : "");
    app.innerHTML = '<section class="panel narrow"><h1>Un paso antes de empezar</h1>' +
      "<p>Completá el formulario de registro. Es gratis y toma un minuto. Al enviarlo volvés automáticamente" + (c ? " a <b>" + esc(c.titulo) + "</b>" : " al campus") + ".</p>" +
      '<a class="btn" href="' + esc(url) + '">Ir al formulario de registro</a>' +
      '<p class="muted small">¿Ya te registraste antes o desde otro dispositivo? <button class="link" id="ya-reg">Ingresá tus datos</button></p></section>';
    document.getElementById("ya-reg").addEventListener("click", function () {
      abrirDialogo("datos", function () { location.hash = c ? "#/curso/" + c.id : "#/"; });
    });
  }

  function vistaCurso(cid, lid) {
    var c = curso(cid);
    if (!c) return vistaNoEncontrado();
    if (!S.perfil) return requiereRegistro(cid, router);
    var ls = lecciones(c);
    var idx = 0;
    if (lid) { idx = ls.findIndex(function (x) { return x.lec.id === lid; }); if (idx < 0) idx = 0; }
    else { var p = ls.findIndex(function (x) { return !hecho(c.id, x.lec.id); }); idx = p < 0 ? 0 : p; }
    var actual = ls[idx], a = avance(c);

    var nav = '<nav class="side" aria-label="Contenido del curso"><a href="#/" class="back">← Todos los cursos</a>' +
      '<h2>' + esc(c.titulo) + '</h2><div class="bar"><span style="width:' + a.pct + '%"></span></div><p class="meta">' + a.hechas + " de " + a.total + " actividades</p>";
    c.modulos.forEach(function (m, mi) {
      nav += '<h3>' + (mi + 1) + ". " + esc(m.titulo) + "</h3><ol>";
      m.lecciones.forEach(function (l) {
        var cls = (l.id === actual.lec.id ? "on " : "") + (hecho(c.id, l.id) ? "done" : "");
        nav += '<li class="' + cls + '"><a href="#/curso/' + c.id + "/" + l.id + '"><span class="dot" aria-hidden="true"></span>' + esc(l.titulo) + (hecho(c.id, l.id) ? '<span class="sr"> (completada)</span>' : "") + "</a></li>";
      });
      nav += "</ol>";
    });
    if (completo(c)) nav += '<a class="btn small" href="#/certificado/' + c.id + '">Ver certificado</a>';
    nav += "</nav>";

    var l = actual.lec;
    var body = '<article class="lesson"><p class="kicker">' + esc(actual.mod.titulo) + " · " + (idx + 1) + "/" + ls.length + "</p><h1>" + esc(l.titulo) + "</h1>";
    body += '<div class="content">' + (l.contenido || "") + "</div>";
    if (l.tipo === "video") body += bloqueVideo(l);
    if (l.tipo === "recurso") body += '<p><a class="btn ghost" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.textoBoton || "Abrir recurso") + " ↗</a></p>";
    if (l.tipo === "quiz") body += bloqueQuiz(c, l);
    if (l.tipo === "pregunta") body += bloquePregunta(c, l);
    body += '<div class="lesson-nav">';
    body += idx > 0 ? '<a class="btn ghost" href="#/curso/' + c.id + "/" + ls[idx - 1].lec.id + '">← Anterior</a>' : "<span></span>";
    var sig = idx < ls.length - 1 ? "#/curso/" + c.id + "/" + ls[idx + 1].lec.id : "#/certificado/" + c.id;
    var etiqueta = idx < ls.length - 1 ? "Siguiente →" : "Terminar curso";
    if (l.tipo === "quiz" || l.tipo === "pregunta") {
      body += '<a class="btn" id="sig" href="' + sig + '"' + (hecho(c.id, l.id) ? "" : ' aria-disabled="true"') + ">" + etiqueta + "</a>";
    } else {
      body += '<a class="btn" id="sig" href="' + sig + '" data-marca="1">' + (hecho(c.id, l.id) ? etiqueta : "Listo, " + etiqueta.toLowerCase()) + "</a>";
    }
    body += "</div></article>";

    app.innerHTML = '<div class="course">' + nav + body + "</div>";

    var sigBtn = document.getElementById("sig");
    sigBtn.addEventListener("click", function (e) {
      if (sigBtn.getAttribute("aria-disabled") === "true") { e.preventDefault(); var f = app.querySelector(".needs"); if (f) { f.classList.add("shake"); setTimeout(function(){f.classList.remove("shake");}, 500); } return; }
      if (sigBtn.getAttribute("data-marca")) marcar(c.id, l.id);
      if (idx === ls.length - 1 && !completo(c)) { e.preventDefault(); alert("Te faltan actividades por completar. Las marcadas con un círculo vacío en el índice."); router(); }
    });
    if (l.tipo === "quiz") activarQuiz(c, l, sigBtn);
    if (l.tipo === "pregunta") activarPregunta(c, l, sigBtn);
    app.focus();
    window.scrollTo(0, 0);
  }

  function bloqueVideo(l) {
    var id = ytId(l.youtube);
    if (!id || id === "VIDEO_DE_EJ") {
      return '<div class="video placeholder"><p>Acá va el video. Pegá el link de YouTube en <code>contenido.js</code>.</p></div>';
    }
    return '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(l.titulo) + '" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
  }

  function bloqueQuiz(c, l) {
    var h = '<form class="quiz needs" id="quiz">';
    l.preguntas.forEach(function (p, i) {
      h += '<fieldset><legend>' + (i + 1) + ". " + esc(p.texto) + "</legend>";
      p.opciones.forEach(function (o, j) {
        h += '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required> <span>' + esc(o) + "</span></label>";
      });
      h += '<p class="fb" id="fb' + i + '" hidden></p></fieldset>';
    });
    h += '<button class="btn" type="submit">Revisar respuestas</button><p class="result" id="quiz-res" aria-live="polite"></p></form>';
    return h;
  }
  function activarQuiz(c, l, sigBtn) {
    var f = document.getElementById("quiz");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = 0;
      l.preguntas.forEach(function (p, i) {
        var sel = f.querySelector('input[name="q' + i + '"]:checked');
        var bien = sel && Number(sel.value) === p.correcta;
        if (bien) ok++;
        var fb = document.getElementById("fb" + i);
        fb.hidden = false;
        fb.className = "fb " + (bien ? "ok" : "no");
        fb.textContent = (bien ? "Correcto. " : "Revisá esta. ") + (p.explicacion || "");
      });
      var min = l.aprobar || l.preguntas.length;
      var res = document.getElementById("quiz-res");
      if (ok >= min) {
        res.textContent = "¡Bien! " + ok + " de " + l.preguntas.length + " correctas.";
        res.className = "result ok";
        marcar(c.id, l.id);
        sigBtn.removeAttribute("aria-disabled");
        f.classList.remove("needs");
      } else {
        res.textContent = ok + " de " + l.preguntas.length + " correctas. Necesitás " + min + " para seguir: revisá y probá de nuevo.";
        res.className = "result no";
      }
    });
  }

  function bloquePregunta(c, l) {
    var prev = (S.respuestas[c.id] || {})[l.id] || "";
    return '<form class="pregunta needs" id="preg"><label for="resp" class="sr">Tu respuesta</label>' +
      '<textarea id="resp" rows="6" placeholder="Escribí tu respuesta acá…">' + esc(prev) + "</textarea>" +
      '<div class="row-between"><span class="muted small" id="cuenta"></span><button class="btn" type="submit">Guardar respuesta</button></div>' +
      '<p class="result" id="preg-res" aria-live="polite"></p></form>';
  }
  function activarPregunta(c, l, sigBtn) {
    var f = document.getElementById("preg"), t = document.getElementById("resp"), cuenta = document.getElementById("cuenta");
    var min = l.minimo || 1;
    function upd() { var n = t.value.trim().length; cuenta.textContent = n < min ? "Mínimo " + min + " caracteres (" + n + ")" : "✓ Largo suficiente"; }
    t.addEventListener("input", upd); upd();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = t.value.trim(), res = document.getElementById("preg-res");
      if (v.length < min) { res.textContent = "Escribí un poco más (mínimo " + min + " caracteres)."; res.className = "result no"; return; }
      S.respuestas[c.id] = S.respuestas[c.id] || {};
      S.respuestas[c.id][l.id] = v;
      marcar(c.id, l.id);
      res.textContent = "Respuesta guardada."; res.className = "result ok";
      sigBtn.removeAttribute("aria-disabled");
      f.classList.remove("needs");
    });
  }

  function urlFinalizacion(c) {
    var fz = CFG.finalizacion;
    if (!fz || !fz.urlFormulario) return null;
    var k = fz.campos || {}, p = [];
    function add(alias, val) { if (alias) p.push(alias + "=" + encodeURIComponent(val)); }
    var resp = S.respuestas[c.id] || {}, txt = [];
    lecciones(c).forEach(function (x) { if (resp[x.lec.id]) txt.push(x.lec.titulo + ": " + resp[x.lec.id]); });
    add(k.email, S.perfil.email); add(k.nombre, S.perfil.nombre); add(k.curso, c.titulo);
    add(k.codigo, codigoCert(c)); add(k.respuestas, txt.join(" | ").slice(0, 1500));
    return fz.urlFormulario + (fz.urlFormulario.indexOf("?") < 0 ? "?" : "&") + p.join("&");
  }

  function vistaCertificado(cid) {
    var c = curso(cid);
    if (!c) return vistaNoEncontrado();
    if (!S.perfil) return requiereRegistro(cid, router);
    if (!completo(c)) {
      var a = avance(c);
      app.innerHTML = '<section class="panel narrow"><h1>Todavía no terminaste</h1><p>Completaste ' + a.hechas + " de " + a.total + ' actividades de <b>' + esc(c.titulo) + '</b>.</p><a class="btn" href="#/curso/' + c.id + '">Seguir el curso</a></section>';
      return;
    }
    var fin = urlFinalizacion(c);
    app.innerHTML =
      '<div class="cert-actions no-print"><a href="#/" class="back">← Todos los cursos</a>' +
      '<div class="row-gap">' + (fin ? '<a class="btn ghost" href="' + esc(fin) + '" target="_blank" rel="noopener">Avisar a EMPUJAR que terminé</a>' : "") +
      '<button class="btn" id="imprimir">Descargar PDF</button></div></div>' +
      '<section class="cert" style="--c:' + esc(c.color || "var(--accent)") + '">' +
      '<p class="cert-org">' + esc(CFG.organizacion) + "</p>" +
      '<p class="cert-kicker">Certificado de finalización</p>' +
      '<p class="cert-txt">Se certifica que</p><p class="cert-name">' + esc(S.perfil.nombre) + "</p>" +
      '<p class="cert-txt">completó el curso</p><p class="cert-course">' + esc(c.titulo) + "</p>" +
      '<p class="cert-txt">del ' + esc(CFG.nombre) + ", el " + fechaLarga(fechaFin(c)) + ".</p>" +
      '<div class="cert-foot"><div><span class="cert-line"></span><b>' + esc(CFG.firmaNombre) + "</b><br>" + esc(CFG.firmaCargo) + "</div>" +
      '<div class="cert-code">Código: ' + codigoCert(c) + "</div></div></section>" +
      '<p class="muted small center no-print">En la ventana de impresión elegí «Guardar como PDF».</p>';
    document.getElementById("imprimir").addEventListener("click", function () { window.print(); });
  }

  function vistaNoEncontrado() {
    app.innerHTML = '<section class="panel narrow"><h1>No encontramos esa página</h1><a class="btn" href="#/">Ver cursos</a></section>';
  }

  /* ---------- Encabezado / pie ---------- */
  function pintarUsuario() {
    var w = document.getElementById("who");
    if (S.perfil) {
      w.hidden = false;
      w.innerHTML = esc(S.perfil.nombre.split(" ")[0]) + ' · <button class="link" id="salir">Salir</button>';
      document.getElementById("salir").addEventListener("click", function () {
        if (confirm("¿Cerrar sesión en este dispositivo? Se borra tu avance guardado acá.")) {
          memoria = { perfil: null, progreso: {}, respuestas: {}, pendiente: null }; S = memoria; guardar();
          pintarUsuario(); location.hash = "#/"; router();
        }
      });
    } else { w.hidden = true; w.innerHTML = ""; }
  }

  document.getElementById("brand").textContent = CFG.nombre;
  document.title = CFG.nombre;
  document.getElementById("banner-prueba").hidden = faRegistro;
  document.getElementById("footer").innerHTML = esc(CFG.organizacion) + ' · <a href="' + esc(CFG.contacto) + '" target="_blank" rel="noopener">Conocé más</a>';

  /* ---------- Router ---------- */
  function router() {
    var parts = (location.hash || "#/").replace(/^#\/?/, "").split("/");
    if (parts[0] === "curso") return vistaCurso(parts[1], parts[2]);
    if (parts[0] === "certificado") return vistaCertificado(parts[1]);
    if (parts[0] === "registro" && faRegistro) return vistaRegistroFA(parts[1]);
    return vistaInicio();
  }
  window.addEventListener("hashchange", router);
  pintarUsuario();
  router();
})();
