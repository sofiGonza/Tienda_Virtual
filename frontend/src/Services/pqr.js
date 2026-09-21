import { api } from './api';
export const listarPQR=()=>api('/pqr');
export const crearPQR=(data)=>api('/pqr',{method:'POST',body:JSON.stringify(data)});
export const actualizarPQR=(id,data)=>api(`/pqr/${id}`,{method:'PATCH',body:JSON.stringify(data)});
