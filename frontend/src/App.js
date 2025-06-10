import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
      .then(res => res.text())
      .then(data => setMsg(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return <h1>{msg}</h1>;
}

export default App;
