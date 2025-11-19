import React, { useState, useEffect } from 'react';

function TournamentActive({ players, tournament, onRefresh }) {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [nextMatches, setNextMatches] = useState([]);
  const [rankings, setRankings] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ goalsP1: '', goalsP2: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCurrentPhase();
    fetchNextMatches();
    fetchRankings();
  }, []);

  const fetchCurrentPhase = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/current-phase');
      const data = await response.json();
      setCurrentPhase(data);
    } catch (error) {
      console.error('Erro ao buscar fase atual:', error);
    }
  };

  const fetchNextMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/next-matches');
      const data = await response.json();
      setNextMatches(data);
    } catch (error) {
      console.error('Erro ao buscar próximos jogos:', error);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/rankings');
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
    }
  };

  const refreshAll = () => {
    onRefresh();
    fetchCurrentPhase();
    fetchNextMatches();
    fetchRankings();
  };

  const registerScore = async (match, leg) => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/register-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          leg: leg,
          goalsP1: parseInt(scoreForm.goalsP1),
          goalsP2: parseInt(scoreForm.goalsP2)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Placar registrado!`);
        setSelectedMatch(null);
        setScoreForm({ goalsP1: '', goalsP2: '' });
        setTimeout(() => {
          setMessage('');
          refreshAll();
        }, 1500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao registrar placar');
    }
  };

  const openScoreModal = (match, leg) => {
    setSelectedMatch({ match, leg });
    setScoreForm({ goalsP1: '', goalsP2: '' });
    setMessage('');
  };

  if (!currentPhase) {
    return <div>Carregando...</div>;
  }

  const phaseName = currentPhase.isFinal ? 'FINAL' : `Fase ${currentPhase.phaseNumber}`;

  return (
    <div className="tournament-active">
      <h2>🔥 Torneio em Andamento - {phaseName}</h2>

      {/* Próximos Confrontos */}
      <section className="next-matches">
        <h3>📅 Próximos Jogos</h3>
        {nextMatches.length === 0 ? (
          <p>Nenhum jogo pendente. Todos os confrontos da fase atual foram concluídos!</p>
        ) : (
          <div className="matches-list">
            {nextMatches.map(match => (
              <div key={match.id} className="match-card next">
                <div className="match-header">
                  <strong>{match.player1.name} vs {match.player2.name}</strong>
                  <span className="match-leg">{match.nextLeg === 'ida' ? 'Jogo de Ida' : 'Jogo de Volta'}</span>
                </div>
                <button 
                  className="btn-register-score"
                  onClick={() => openScoreModal(match, match.nextLeg)}
                >
                  Registrar Placar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confrontos da Fase Atual */}
      <section className="current-phase-matches">
        <h3>🎮 Confrontos da {phaseName}</h3>
        <div className="matches-grid">
          {currentPhase.matches.map(match => {
            const aggregateP1 = (match.goalsP1Ida || 0) + (match.goalsP1Volta || 0);
            const aggregateP2 = (match.goalsP2Ida || 0) + (match.goalsP2Volta || 0);

            return (
              <div key={match.id} className={`match-card ${match.completed ? 'completed' : ''}`}>
                <div className="match-players">
                  <span className={match.winner?.id === match.player1.id ? 'winner' : ''}>
                    {match.player1.name}
                  </span>
                  <span className="vs">vs</span>
                  <span className={match.winner?.id === match.player2.id ? 'winner' : ''}>
                    {match.player2.name}
                  </span>
                </div>

                {!match.isFinal && (
                  <>
                    <div className="match-score">
                      <span className="leg-label">Ida:</span>
                      <span className={match.idaCompleted ? 'completed-score' : 'pending'}>
                        {match.idaCompleted 
                          ? `${match.goalsP1Ida} x ${match.goalsP2Ida}` 
                          : 'Pendente'
                        }
                      </span>
                    </div>
                    <div className="match-score">
                      <span className="leg-label">Volta:</span>
                      <span className={match.voltaCompleted ? 'completed-score' : 'pending'}>
                        {match.voltaCompleted 
                          ? `${match.goalsP1Volta} x ${match.goalsP2Volta}` 
                          : 'Pendente'
                        }
                      </span>
                    </div>
                  </>
                )}

                {match.isFinal && (
                  <div className="match-score">
                    <span className="leg-label">Placar:</span>
                    <span className={match.idaCompleted ? 'completed-score' : 'pending'}>
                      {match.idaCompleted 
                        ? `${match.goalsP1Ida} x ${match.goalsP2Ida}` 
                        : 'Pendente'
                      }
                    </span>
                  </div>
                )}

                {match.completed && !match.isFinal && (
                  <div className="match-aggregate">
                    <strong>Agregado: {aggregateP1} x {aggregateP2}</strong>
                  </div>
                )}

                {match.completed && match.winner && (
                  <div className="match-winner">
                    🏆 Vencedor: <strong>{match.winner.name}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Rankings */}
      {rankings && (
        <section className="rankings">
          <h3>📊 Rankings</h3>
          <div className="rankings-grid">
            <div className="ranking-box">
              <h4>🏅 Por Vitórias</h4>
              <ol>
                {rankings.byWins.slice(0, 5).map(p => (
                  <li key={p.id}>{p.name} - {p.wins} vitória(s)</li>
                ))}
              </ol>
            </div>

            <div className="ranking-box">
              <h4>⚽ Artilheiros</h4>
              <ol>
                {rankings.byGoals.slice(0, 5).map(p => (
                  <li key={p.id}>{p.name} - {p.goals} gol(s)</li>
                ))}
              </ol>
            </div>

            <div className="ranking-box">
              <h4>💰 Grana Acumulada</h4>
              <ol>
                {rankings.byEarnings.slice(0, 5).map(p => (
                  <li key={p.id}>{p.name} - R$ {p.earnings.toFixed(2)}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Modal de Registro de Placar */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Registrar Placar - {selectedMatch.leg === 'ida' ? 'Ida' : selectedMatch.leg === 'volta' ? 'Volta' : 'Final'}</h3>
            <p><strong>{selectedMatch.match.player1.name} vs {selectedMatch.match.player2.name}</strong></p>
            
            <div className="score-inputs">
              <div className="score-input">
                <label>{selectedMatch.match.player1.name}</label>
                <input 
                  type="number" 
                  min="0"
                  value={scoreForm.goalsP1}
                  onChange={(e) => setScoreForm({ ...scoreForm, goalsP1: e.target.value })}
                  placeholder="Gols"
                />
              </div>
              <span className="vs">X</span>
              <div className="score-input">
                <label>{selectedMatch.match.player2.name}</label>
                <input 
                  type="number" 
                  min="0"
                  value={scoreForm.goalsP2}
                  onChange={(e) => setScoreForm({ ...scoreForm, goalsP2: e.target.value })}
                  placeholder="Gols"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => registerScore(selectedMatch.match, selectedMatch.leg)} 
                className="btn-confirm"
                disabled={scoreForm.goalsP1 === '' || scoreForm.goalsP2 === ''}
              >
                Confirmar
              </button>
              <button onClick={() => setSelectedMatch(null)} className="btn-cancel">Cancelar</button>
            </div>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentActive;
