import { api } from './api';
export const enviarMensaje=(data)=>api('/chatbot/mensaje',{method:'POST',body:JSON.stringify(data)});
