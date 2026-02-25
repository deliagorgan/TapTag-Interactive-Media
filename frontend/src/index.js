import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';


import { AuthProvider } from './context/AuthContext';


axios.defaults.withCredentials = false;
axios.interceptors.request.use(cfg => {
  const t = sessionStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
     <AuthProvider>  {/* Învelește aplicația în AuthProvider */}
    <App />
    </AuthProvider>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
