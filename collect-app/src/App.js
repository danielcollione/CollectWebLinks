import React from 'react';
import logo from './logo.svg';
import './App.css';



function App(url) {
  return (
    <div className="App">
      <header className="App-header">
      <input placeholder='Digite a URL desejada'></input>
        <button>BUSCAR</button>
      </header>
    </div>
  );
}

export default App;
