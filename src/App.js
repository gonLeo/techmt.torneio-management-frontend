import React, { useState, useEffect } from 'react';
import './styles/App.css';
import PreTournament from './components/PreTournament';
import TournamentActive from './components/TournamentActive';
import TournamentFinished from './components/TournamentFinished';

function App() {
  const [tournamentStatus, setTournamentStatus] = useState('pre-tournament');
  const [players, setPlayers] = useState([]);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    fetchPlayers();
    fetchTournamentStatus();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/players');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
    }
  };

  const fetchTournamentStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/status');
      const data = await response.json();
      setTournament(data);
      setTournamentStatus(data.status);
    } catch (error) {
      console.error('Erro ao buscar status do torneio:', error);
    }
  };

  const refreshData = () => {
    fetchPlayers();
    fetchTournamentStatus();
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏆 Torneio Híbrido EA FC 24 🏆</h1>
        <p className="subtitle">Presencial e online, com prêmio em dinheiro e cerveja para aumentar a competitividade</p>
      </header>

      {tournamentStatus === 'pre-tournament' && (
        <PreTournament 
          players={players} 
          tournament={tournament}
          onRefresh={refreshData}
        />
      )}

      {tournamentStatus === 'in-progress' && (
        <TournamentActive 
          players={players}
          tournament={tournament}
          onRefresh={refreshData}
        />
      )}

      {tournamentStatus === 'finished' && (
        <TournamentFinished 
          players={players}
          tournament={tournament}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}

export default App;
