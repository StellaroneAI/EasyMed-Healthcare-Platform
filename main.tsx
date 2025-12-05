import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const Root = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        background: '#0f172a',
        color: 'white',
      }}
    >
      Hello Macha 👋 – TEST PAGE
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);