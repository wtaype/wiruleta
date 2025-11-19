import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { auth, db } from '../firebase/init.js'; // Importa la configuración de Firebase desde tu archivo de inicialización
import { getFirestore,
  setDoc, getDoc, deleteDoc, onSnapshot, // Lo mas usados
  doc, collection, getDocs, serverTimestamp, // Muy utiles 
  query, where, orderBy, limit } from "firebase/firestore";  //Para Firestore
import { wiTema, Capi, Mensaje, Notificacion, savels, getls, removels, accederRol } from './widev.js'; //Tools geniales 

$('h1').click(async function(){
  Mensaje('Escribiendo en base de datos, espere...');
  try {
    const wisave = doc(db, 'publico', 'wilder');
    await setDoc(wisave, {
      nombre: 'Wilder',
      apellidos: 'Uno Dos', 
      mensaje: 'Hola, Dios te protege!',
      creacion: serverTimestamp()
    });
    Mensaje('✅ Documento guardado exitosamente!');
  }catch(e){console.error(e)}
}); // Esto es para save - guardar el documento


$('button').click(async function(){
  Mensaje('Esperando un mensaje ');
  try {
    const wiget = doc(db, 'publico', 'wilder');
    const busq = await getDoc(wiget);
    if (busq.exists()){
      const data = busq.data();
      Mensaje(data.mensaje);
    }
  }catch(e){console.error(e)}
}); // Esto es para get -consultar el documento