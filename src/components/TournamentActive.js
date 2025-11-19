import React, { useState, useEffect } from 'react';

function TournamentActive({ players, tournament, onRefresh }) {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [allPhases, setAllPhases] = useState([]);
  const [nextMatches, setNextMatches] = useState([]);
  const [rankings, setRankings] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ goalsP1: '', goalsP2: '' });
  const [message, setMessage] = useState('');
  const [penaltyMatch, setPenaltyMatch] = useState(null);

  useEffect(() => {
    fetchCurrentPhase();
    fetchAllPhases();
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

  const fetchAllPhases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/phases');
      const data = await response.json();
      setAllPhases(data);
    } catch (error) {
      console.error('Erro ao buscar histórico de fases:', error);
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
    fetchAllPhases();
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
        // Check if this was volta and if there's a tie in aggregate
        if (leg === 'volta' && !match.isFinal) {
          const aggregateP1 = (match.goalsP1Ida || 0) + parseInt(scoreForm.goalsP1);
          const aggregateP2 = (match.goalsP2Ida || 0) + parseInt(scoreForm.goalsP2);
          
          if (aggregateP1 === aggregateP2) {
            // Show penalty decision UI
            setPenaltyMatch(match);
            setSelectedMatch(null);
            setScoreForm({ goalsP1: '', goalsP2: '' });
            return;
          }
        }

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

  const setPenaltyWinner = async (matchId, winnerId) => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/set-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, winnerId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Vencedor por pênaltis definido!`);
        setPenaltyMatch(null);
        setTimeout(() => {
          setMessage('');
          refreshAll();
        }, 1500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao definir vencedor');
    }
  };

  const openScoreModal = (match, leg) => {
    setSelectedMatch({ match, leg });
    setScoreForm({ goalsP1: '', goalsP2: '' });
    setMessage('');
  };

  const advancePhase = async () => {
    if (!window.confirm('Deseja avançar para a próxima fase?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tournament/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setMessage('');
          refreshAll();
        }, 1500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao avançar fase');
    }
  };

  if (!currentPhase) {
    return <div className="tournament-active"><p>Carregando...</p></div>;
  }

  const phaseName = currentPhase.isFinal ? 'FINAL' : `Fase ${currentPhase.phaseNumber}`;

  return (
    <div className="tournament-active">
      <h2>🔥 Torneio em Andamento - {phaseName}</h2>

      {/* Bye Player Info */}
      {currentPhase.byePlayer && (
        <div className="bye-player-info">
          ⚡ <strong>{currentPhase.byePlayer.name}</strong> avança automaticamente para a próxima fase (Bye)
        </div>
      )}

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
                  <strong>{match.player1?.name || 'Jogador 1'} vs {match.player2?.name || 'Jogador 2'}</strong>
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
          {currentPhase.matches && currentPhase.matches.map(match => {
            const aggregateP1 = (match.goalsP1Ida || 0) + (match.goalsP1Volta || 0);
            const aggregateP2 = (match.goalsP2Ida || 0) + (match.goalsP2Volta || 0);

            return (
              <div key={match.id} className={`match-card ${match.completed ? 'completed' : ''}`}>
                <div className="match-players">
                  <span className={match.winner && match.winner.id === match.player1?.id ? 'winner' : ''}>
                    {match.player1?.name || 'Jogador 1'}
                  </span>
                  <span className="vs">vs</span>
                  <span className={match.winner && match.winner.id === match.player2?.id ? 'winner' : ''}>
                    {match.player2?.name || 'Jogador 2'}
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
                    {match.decidedByPenalties && <span className="penalty-badge">🎯 Decidido nos pênaltis</span>}
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

      {/* Resumo e Botão de Avançar Fase */}
      {currentPhase && currentPhase.readyToAdvance && !currentPhase.isFinal && (
        <section className="phase-summary">
          <h3>✅ Fase {currentPhase.phaseNumber} Concluída!</h3>
          <div className="summary-content">
            <p><strong>Classificados para a próxima fase:</strong></p>
            <div className="qualified-players">
              {currentPhase.matches.map(match => match.winner && (
                <div key={match.winner.id} className="qualified-player">
                  🏆 {match.winner.name}
                </div>
              ))}
              {currentPhase.byePlayer && (
                <div className="qualified-player bye">
                  ⚡ {currentPhase.byePlayer.name} (Bye)
                </div>
              )}
            </div>
            <button className="btn-advance-phase" onClick={advancePhase}>
              🚀 Iniciar Próxima Fase
            </button>
          </div>
        </section>
      )}

      {/* Histórico de Fases Anteriores */}
      {allPhases.length > 1 && (
        <section className="phases-history">
          <h3>📜 Histórico de Fases</h3>
          {allPhases.map((phase, phaseIndex) => {
            // Não mostrar a fase atual aqui
            if (phaseIndex === tournament.currentPhase) {
              return null;
            }

            const phaseTitle = phase.isFinal ? 'FINAL' : `Fase ${phase.phaseNumber}`;

            return (
              <div key={phaseIndex} className="history-phase">
                <h4>{phaseTitle}</h4>
                <div className="history-matches">
                  {phase.matches.map(match => {
                    const aggregateP1 = (match.goalsP1Ida || 0) + (match.goalsP1Volta || 0);
                    const aggregateP2 = (match.goalsP2Ida || 0) + (match.goalsP2Volta || 0);

                    return (
                      <div key={match.id} className="history-match-card">
                        <div className="match-players">
                          <span className={match.winner && match.winner.id === match.player1?.id ? 'winner' : ''}>
                            {match.player1?.name || 'Jogador 1'}
                          </span>
                          <span className="vs">vs</span>
                          <span className={match.winner && match.winner.id === match.player2?.id ? 'winner' : ''}>
                            {match.player2?.name || 'Jogador 2'}
                          </span>
                        </div>

                        {!match.isFinal && (
                          <>
                            <div className="match-score">
                              <span className="leg-label">Ida:</span>
                              <span>{match.goalsP1Ida} x {match.goalsP2Ida}</span>
                            </div>
                            <div className="match-score">
                              <span className="leg-label">Volta:</span>
                              <span>{match.goalsP1Volta} x {match.goalsP2Volta}</span>
                            </div>
                            <div className="match-aggregate">
                              <strong>Agregado: {aggregateP1} x {aggregateP2}</strong>
                              {match.decidedByPenalties && <span className="penalty-badge">🎯 Pênaltis</span>}
                            </div>
                          </>
                        )}

                        {match.isFinal && (
                          <div className="match-score">
                            <span className="leg-label">Placar:</span>
                            <span>{match.goalsP1Ida} x {match.goalsP2Ida}</span>
                          </div>
                        )}

                        <div className="match-winner">
                          🏆 <strong>{match.winner?.name}</strong>
                        </div>
                      </div>
                    );
                  })}
                  {phase.byePlayer && (
                    <div className="history-bye">
                      ⚡ {phase.byePlayer.name} avançou automaticamente (Bye)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

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
            <p><strong>{selectedMatch.match.player1?.name || 'Jogador 1'} vs {selectedMatch.match.player2?.name || 'Jogador 2'}</strong></p>
            
            <div className="score-inputs">
              <div className="score-input">
                <label>{selectedMatch.match.player1?.name || 'Jogador 1'}</label>
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
                <label>{selectedMatch.match.player2?.name || 'Jogador 2'}</label>
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

      {/* Modal de Pênaltis */}
      {penaltyMatch && (
        <div className="modal-overlay" onClick={() => setPenaltyMatch(null)}>
          <div className="modal penalty-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎯 PÊNALTIS - Empate no Agregado!</h3>
            <p className="penalty-info">
              O placar agregado terminou empatado. Clique no jogador que venceu a disputa de pênaltis:
            </p>
            
            <div className="penalty-buttons">
              <button 
                className="btn-penalty-winner"
                onClick={() => setPenaltyWinner(penaltyMatch.id, penaltyMatch.player1?.id)}
              >
                <span className="player-name">{penaltyMatch.player1?.name || 'Jogador 1'}</span>
                <span className="trophy-icon">🏆</span>
              </button>
              
              <button 
                className="btn-penalty-winner"
                onClick={() => setPenaltyWinner(penaltyMatch.id, penaltyMatch.player2?.id)}
              >
                <span className="player-name">{penaltyMatch.player2?.name || 'Jogador 2'}</span>
                <span className="trophy-icon">🏆</span>
              </button>
            </div>

            <button onClick={() => setPenaltyMatch(null)} className="btn-cancel">Cancelar</button>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentActive;
