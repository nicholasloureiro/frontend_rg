import React from 'react';
import '../styles/Home.css';
import Header from '../components/Header';

const Home = () => {
  return (
    <>
      <Header nomeHeader="Home" />
      <div className="home">
        <h1>Página Home</h1>
      </div>
    </>
  );
};

export default Home; 