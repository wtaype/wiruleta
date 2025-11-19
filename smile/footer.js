import $ from 'jquery';
export { footer }; window.footer = footer;

const lanzamiento = 2024;
const autor = '@wilder.taype';
const link = 'https://wtaype.github.io/';
const version = 'v11';


/** ACTUALIZACION TAG version dia hora   [START]  
git add . ; git commit -m "Actualizacion Principal v11.11.39"
git push origin main

// Actualizar despues de main- 
git tag v11 -m "Version v11" ; git push origin v11

 ACTUALIZACION TAG[END] */ 

function footer(){
  const ahora = new Date();
  return `
  <footer class="foo wb txc psa">
    <span>Creado con <i class="fas fa-heart"></i> by <a class="ftx lkme" href="${link}" target="_blank">${autor}</a></span>
    <span>${lanzamiento} - <span class="wty">${ahora.getFullYear()}</span></span>
    <span class="abw"> | Acerca del app ${version} | actualizado:
    <span class="wtu">${ahora.toLocaleString()}</span></span>
  </footer>
  `;
};

// === AUTO-EJECUCIÓN DE ESTILOS ===
(() => {
  $('style').append(`.foo{width:100%;text-align:center;padding-block:1.5vh 1vh;background:var(--wb);border-radius:1vh 1vh 0 0;}.foo *{font-size:var(--fz_s2);margin-inline:.3vh;}.foo a{color:var(--bg2);}.foo i{color:var(--mco);}.abwc{background:var(--bg);top:0;width:99%;height:100%;padding:2vh 2vw;overflow:scroll;line-height:1.80;}.abwok{background:var(--mco);color:var(--txa);}`);
})();