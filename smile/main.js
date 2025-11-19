import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { wiTema, Notificacion, savels, getls, removels, Tiempo } from './widev.js';

// ========================================
// 🎨 CONFIGURACIÓN Y COLORES
// ========================================
const colores = [
  ['#FF6B6B', '#EE5A6F'], ['#4ECDC4', '#44A08D'], ['#FFD93D', '#F6C445'],
  ['#A8E6CF', '#7DCFB6'], ['#FFA07A', '#FF7F50'], ['#B794F4', '#9F7AEA'],
  ['#63B3ED', '#4299E1'], ['#F687B3', '#ED64A6'], ['#9AE6B4', '#68D391'],
  ['#FBD38D', '#F6AD55'], ['#FC8181', '#F56565'], ['#90CDF4', '#63B3ED'],
  ['#3cd741', '#25b62a'], ['#00a8e6', '#0094cc'], ['#ffa726', '#ff9800']
];

const iconos = [
  'fa-user-astronaut', 'fa-robot', 'fa-rocket', 'fa-space-shuttle',
  'fa-star', 'fa-crown', 'fa-gem', 'fa-fire', 'fa-bolt', 'fa-heart',
  'fa-flag', 'fa-trophy', 'fa-medal', 'fa-award', 'fa-shield-alt'
];

// ========================================
// 🎯 VARIABLES GLOBALES
// ========================================
let participantes = [];
let ordenCompleto = [];
let girando = false;
let anguloActual = 0;
let ganadorSeleccionado = null;
let sorteoActualId = null;

// ========================================
// 🎯 ELEMENTOS DOM (CACHÉ)
// ========================================
const dom = {
  canvas: document.getElementById('rlt_cnv'),
  btnGirar: $('#btn_gir'),
  btnComenzar: $('#btn_cmz'),
  btnResetear: $('#btn_rst'),
  btnLimpiar: $('#btn_lmp'),
  btnLimpiarHist: $('#btn_lmp_hst'),
  txtParticipantes: $('#txt_prt'),
  chkEliminar: $('#chk_elm'),
  chkChocolatear: $('#chk_chc'),
  cardGanador: $('#gnd_crd'),
  txtGanador: $('#gnd_txt'),
  icnGanador: $('#gnd_icn'),
  modalPodio: $('#podio_modal'),
  btnNuevoSorteo: $('#btn_nvs'),
  btnCerrarPodio: $('#btn_crp'),
  tblBody: $('#tbl_bdy')
};

const ctx = dom.canvas?.getContext('2d');

// ========================================
// 🚀 INICIALIZACIÓN
// ========================================
$(() => {
  setTimeout(() => $('.loadingSmile').fadeOut(400), 2000);
  init();
});

function init() {
  cargarHistorial();
  actualizarEstadoGanador('listo');
  registrarEventos();
  dom.txtParticipantes.val('Grupo 1\nGrupo 2\nGrupo 3');
  actualizarParticipantes();
}

// ========================================
// 🎯 REGISTRAR EVENTOS
// ========================================
function registrarEventos() {
  dom.btnGirar.on('click', girarRuleta);
  dom.btnComenzar.on('click', girarRuleta);
  dom.btnResetear.on('click', resetear);
  dom.btnLimpiar.on('click', limpiar);
  dom.btnLimpiarHist.on('click', limpiarHistorial);
  dom.btnNuevoSorteo.on('click', nuevoSorteo);
  dom.btnCerrarPodio.on('click', cerrarPodio);
  dom.txtParticipantes.on('input', actualizarParticipantes);
}

// ========================================
// 🎨 ACTUALIZAR ESTADO GANADOR
// ========================================
function actualizarEstadoGanador(estado, datos = {}) {
  const config = {
    listo: { icono: 'fa-circle-notch', texto: 'Listo para elegir ganador', clase: 'est_lst' },
    girando: { icono: 'fa-spinner fa-spin', texto: 'Eligiendo al ganador...', clase: 'est_gir' },
    ganador: { icono: datos.icono || 'fa-trophy', texto: `Ganador es: ${datos.nombre}`, clase: 'est_gnd' },
    final: { icono: 'fa-crown', texto: `🏆 Último ganador es: ${datos.nombre}`, clase: 'est_fnl' }
  }[estado];
  
  dom.cardGanador.removeClass('est_lst est_gir est_gnd est_fnl').addClass(config.clase);
  dom.icnGanador.attr('class', `fas ${config.icono} gnd_icn`);
  dom.txtGanador.text(config.texto);
}

// ========================================
// 🎨 ACTUALIZAR PARTICIPANTES
// ========================================
function actualizarParticipantes() {
  const texto = dom.txtParticipantes.val().trim();
  
  if (!texto) {
    participantes = [];
    dibujarRuleta();
    return;
  }
  
  let lista = texto.split('\n').filter(p => p.trim());
  
  if (dom.chkChocolatear.is(':checked')) {
    lista.sort(() => Math.random() - 0.5);
  }
  
  participantes = lista.map((nombre, idx) => ({
    nombre: nombre.trim(),
    color: colores[idx % colores.length],
    icono: iconos[idx % iconos.length]
  }));
  
  dibujarRuleta();
}

// ========================================
// 🎨 DIBUJAR RULETA
// ========================================
function dibujarRuleta() {
  if (!ctx) return;
  
  const { width, height } = dom.canvas;
  const [centroX, centroY] = [width / 2, height / 2];
  const radio = Math.min(centroX, centroY) - 20;
  
  ctx.clearRect(0, 0, width, height);
  
  if (participantes.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#888';
    ctx.font = '20px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Agrega participantes', centroX, centroY);
    return;
  }
  
  const anguloSegmento = (Math.PI * 2) / participantes.length;
  
  participantes.forEach((p, idx) => {
    const anguloInicio = anguloActual + idx * anguloSegmento;
    const anguloFin = anguloInicio + anguloSegmento;
    
    const gradient = ctx.createLinearGradient(
      centroX + Math.cos(anguloInicio) * radio,
      centroY + Math.sin(anguloInicio) * radio,
      centroX + Math.cos(anguloFin) * radio,
      centroY + Math.sin(anguloFin) * radio
    );
    gradient.addColorStop(0, p.color[0]);
    gradient.addColorStop(1, p.color[1]);
    
    ctx.beginPath();
    ctx.moveTo(centroX, centroY);
    ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Texto
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(anguloInicio + anguloSegmento / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Poppins';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(p.nombre, radio * 0.7, 5);
    ctx.restore();
  });
  
  // Círculo central
  const gradiente = ctx.createRadialGradient(centroX, centroY, 0, centroX, centroY, 60);
  gradiente.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradiente.addColorStop(1, 'rgba(200,200,200,0.8)');
  
  ctx.beginPath();
  ctx.arc(centroX, centroY, 60, 0, Math.PI * 2);
  ctx.fillStyle = gradiente;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// ========================================
// 🎲 GIRAR RULETA
// ========================================
function girarRuleta() {
  if (girando) return;
  
  if (participantes.length === 0) {
    Notificacion('Agrega al menos un participante', 'warning');
    return;
  }
  
  // Crear ID único para este sorteo si es el primero
  if (!sorteoActualId) {
    sorteoActualId = Date.now();
  }
  
  if (participantes.length === 1) {
    declararGanadorFinal();
    return;
  }
  
  girando = true;
  dom.btnGirar.prop('disabled', true).addClass('girando');
  dom.btnComenzar.prop('disabled', true);
  actualizarEstadoGanador('girando');
  
  const vueltas = 5 + Math.floor(Math.random() * 3);
  const anguloTotal = (Math.PI * 2 * vueltas) + (Math.random() * Math.PI * 2);
  
  animarGiro(anguloTotal);
}

// ========================================
// 🎬 ANIMAR GIRO
// ========================================
function animarGiro(anguloObjetivo) {
  const duracion = 4000 + Math.random() * 2000;
  const inicio = Date.now();
  
  const animar = () => {
    const progreso = Math.min((Date.now() - inicio) / duracion, 1);
    const ease = 1 - Math.pow(1 - progreso, 4);
    
    anguloActual = ease * anguloObjetivo;
    dibujarRuleta();
    
    progreso < 1 ? requestAnimationFrame(animar) : finalizarGiro();
  };
  
  animar();
}

// ========================================
// 🏆 FINALIZAR GIRO ✅ GUARDAR CADA GANADOR
// ========================================
function finalizarGiro() {
  girando = false;
  dom.btnGirar.prop('disabled', false).removeClass('girando');
  dom.btnComenzar.prop('disabled', false);
  
  const anguloNormalizado = (anguloActual % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const anguloGanador = (Math.PI * 2 - anguloNormalizado + Math.PI / 2) % (Math.PI * 2);
  const indiceGanador = Math.floor(anguloGanador / ((Math.PI * 2) / participantes.length));
  
  ganadorSeleccionado = participantes[indiceGanador];
  ordenCompleto.push(ganadorSeleccionado);
  
  actualizarEstadoGanador('ganador', ganadorSeleccionado);
  Notificacion(`¡${ganadorSeleccionado.nombre} es el ganador!`, 'success', 3000);
  
  // ✅ GUARDAR CADA GANADOR INMEDIATAMENTE
  guardarGanadorIndividual(ganadorSeleccionado);
  
  if (dom.chkEliminar.is(':checked')) {
    setTimeout(() => {
      const lineas = dom.txtParticipantes.val().split('\n');
      const nuevasLineas = lineas.filter(l => l.trim() !== ganadorSeleccionado.nombre);
      dom.txtParticipantes.val(nuevasLineas.join('\n'));
      actualizarParticipantes();
      
      setTimeout(() => {
        if (participantes.length > 0) actualizarEstadoGanador('listo');
      }, 2000);
    }, 2000);
  }
}

// ========================================
// 💾 GUARDAR GANADOR INDIVIDUAL ✅ NUEVO
// ========================================
function guardarGanadorIndividual(ganador) {
  const historial = getls('wrl_hst') || [];
  
  historial.unshift({
    id: Date.now(),
    ganador: ganador.nombre,
    icono: ganador.icono,
    fecha: new Date().toISOString(),
    tipo: 'individual',
    sorteoId: sorteoActualId
  });
  
  if (historial.length > 50) historial.pop();
  
  savels('wrl_hst', historial, 720);
  cargarHistorial();
}

// ========================================
// 🏆 DECLARAR GANADOR FINAL
// ========================================
function declararGanadorFinal() {
  const ultimo = participantes[0];
  ordenCompleto.push(ultimo);
  
  actualizarEstadoGanador('final', ultimo);
  Notificacion(`🏆 ${ultimo.nombre} es el último ganador!`, 'success', 3000);
  
  // Guardar último ganador individual
  guardarGanadorIndividual(ultimo);
  
  setTimeout(mostrarPodio, 2000);
}

// ========================================
// 🏆 MOSTRAR PODIO
// ========================================
function mostrarPodio() {
  const podio = [...ordenCompleto].reverse();
  const medallas = ['🥇', '🥈', '🥉'];
  const coloresPodio = [
    'linear-gradient(135deg, #FFD700, #FFA500)',
    'linear-gradient(135deg, #C0C0C0, #808080)',
    'linear-gradient(135deg, #CD7F32, #8B4513)'
  ];
  
  $('#podio_body').html(
    podio.map((p, idx) => `
      <div class="podio_item" style="animation-delay:${idx*0.2}s;background:#fff;border-radius:12px;padding:15px;margin:10px 0;box-shadow:0 4px 15px rgba(0,0,0,0.1)">
        <div class="podio_rank" style="background:${coloresPodio[idx]||'linear-gradient(135deg, #667eea, #764ba2)'};width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span class="podio_medal" style="font-size:24px">${medallas[idx]||idx+1}</span>
        </div>
        <div class="podio_inf" style="margin-left:15px;flex:1">
          <i class="fas ${p.icono}" style="color:#667eea;font-size:20px;margin-right:10px"></i>
          <span class="podio_nom" style="font-weight:600;color:#2d3748">${p.nombre}</span>
        </div>
      </div>
    `).join('')
  );
  
  guardarPodioCompleto(podio);
  dom.modalPodio.fadeIn(400);
}

// ========================================
// 💾 GUARDAR PODIO COMPLETO ✅ NUEVO
// ========================================
function guardarPodioCompleto(podio) {
  const historial = getls('wrl_hst') || [];
  
  historial.unshift({
    id: Date.now(),
    ganador: podio[0].nombre,
    icono: 'fa-crown',
    fecha: new Date().toISOString(),
    tipo: 'podio',
    sorteoId: sorteoActualId,
    orden: podio.map(p => p.nombre).join(' → ')
  });
  
  if (historial.length > 50) historial.pop();
  
  savels('wrl_hst', historial, 720);
  cargarHistorial();
}

// ========================================
// 🔄 NUEVO SORTEO
// ========================================
function nuevoSorteo() {
  dom.modalPodio.fadeOut(300);
  ordenCompleto = [];
  anguloActual = 0;
  sorteoActualId = null;
  actualizarEstadoGanador('listo');
  dom.txtParticipantes.val('');
  participantes = [];
  dibujarRuleta();
  Notificacion('¡Listo para nuevo sorteo!', 'info', 2000);
}

// ========================================
// ❌ CERRAR PODIO
// ========================================
function cerrarPodio() {
  dom.modalPodio.fadeOut(300);
}

// ========================================
// 📜 CARGAR HISTORIAL ✅ MEJORADO
// ========================================
function cargarHistorial() {
  const historial = getls('wrl_hst') || [];
  
  if (!historial.length) {
    dom.tblBody.html(`
      <tr class="hst_vac">
        <td colspan="5" style="text-align:center;padding:40px;color:#999">
          <i class="fas fa-inbox" style="font-size:48px;margin-bottom:10px;display:block"></i>
          <p style="font-size:16px">No hay sorteos registrados aún</p>
        </td>
      </tr>
    `);
    return;
  }
  
  dom.tblBody.html(
    historial.map((h, idx) => `
      <tr style="background:#fff;transition:all 0.3s">
        <td><span class="hst_num" style="background:#667eea;color:#fff;padding:5px 10px;border-radius:6px;font-weight:600">${idx + 1}</span></td>
        <td>
          <div class="hst_gnd" style="display:flex;align-items:center;gap:10px">
            <i class="fas ${h.icono}" style="color:#667eea;font-size:18px"></i>
            <span style="font-weight:500;color:#2d3748">${h.ganador}</span>
            ${h.tipo === 'podio' ? '<span style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-left:8px">🏆 PODIO</span>' : ''}
          </div>
        </td>
        <td>
          <div class="hst_fch" style="display:flex;align-items:center;gap:8px;color:#718096">
            <i class="fas fa-clock"></i>
            <span>${Tiempo(h.fecha).fechaCorta} - ${Tiempo(h.fecha).horaCorta}</span>
          </div>
        </td>
        <td><small style="color:#718096">${h.orden || '-'}</small></td>
        <td>
          <button class="btn_eli" data-id="${h.id}" title="Eliminar" style="background:#ff4757;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;transition:all 0.3s">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('')
  );
  
  // Eventos delegados
  dom.tblBody.off('click', '.btn_eli').on('click', '.btn_eli', function() {
    eliminarDeHistorial($(this).data('id'));
  });
}

// ========================================
// 🗑️ ELIMINAR DE HISTORIAL
// ========================================
function eliminarDeHistorial(id) {
  let historial = getls('wrl_hst') || [];
  historial = historial.filter(h => h.id !== id);
  savels('wrl_hst', historial, 720);
  cargarHistorial();
  Notificacion('Entrada eliminada del historial', 'info', 2000);
}

// ========================================
// 🧹 LIMPIAR HISTORIAL
// ========================================
function limpiarHistorial() {
  if (confirm('¿Eliminar todo el historial?')) {
    removels('wrl_hst');
    cargarHistorial();
    Notificacion('Historial limpiado', 'success', 2000);
  }
}

// ========================================
// 🔄 RESETEAR
// ========================================
function resetear() {
  anguloActual = 0;
  girando = false;
  ganadorSeleccionado = null;
  ordenCompleto = [];
  sorteoActualId = null;
  actualizarEstadoGanador('listo');
  dom.btnGirar.prop('disabled', false).removeClass('girando');
  dom.btnComenzar.prop('disabled', false);
  dibujarRuleta();
  Notificacion('Ruleta reseteada', 'info', 2000);
}

// ========================================
// 🗑️ LIMPIAR TODO
// ========================================
function limpiar() {
  dom.txtParticipantes.val('');
  participantes = [];
  anguloActual = 0;
  ordenCompleto = [];
  sorteoActualId = null;
  actualizarEstadoGanador('listo');
  dibujarRuleta();
  Notificacion('Participantes limpiados', 'info', 2000);
}

// ========================================
// 🎨 LOOP DE ANIMACIÓN
// ========================================
function loop() {
  if (!girando && participantes.length > 0) {
    anguloActual += 0.001;
    dibujarRuleta();
  }
  requestAnimationFrame(loop);
}

loop();