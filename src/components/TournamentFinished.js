import React from 'react';

function TournamentFinished({ tournament, players, onRefresh }) {
  const confirmedPlayers = players.filter(p => p.confirmed);
  const sortedByGoals = [...confirmedPlayers].sort((a, b) => b.goals - a.goals);
  const sortedByWins = [...confirmedPlayers].sort((a, b) => b.wins - a.wins);
  const sortedByEarnings = [...confirmedPlayers].sort((a, b) => b.earnings - a.earnings);

  // Calcular bônus de fase e prêmio final
  const totalArrecadado = confirmedPlayers.length * tournament.entryFee;
  const totalBonusPagos = confirmedPlayers.reduce((sum, p) => sum + p.earnings, 0);
  const totalParaDividir = totalArrecadado - totalBonusPagos;
  const championFinalPrize = totalParaDividir * 0.7;
  const runnerUpFinalPrize = totalParaDividir * 0.3;
  
  // Encontrar bônus de fase do campeão e vice
  const championPlayer = players.find(p => p.id === tournament.champion?.id);
  const runnerUpPlayer = players.find(p => p.id === tournament.runnerUp?.id);
  const championPhaseBonus = championPlayer ? championPlayer.earnings - championFinalPrize : 0;
  const runnerUpPhaseBonus = runnerUpPlayer ? runnerUpPlayer.earnings - runnerUpFinalPrize : 0;

  return (
    <div className="tournament-finished">
      <h2>🏆 Torneio Finalizado! 🏆</h2>

      {/* Campeão e Vice */}
      <section className="champions">
        <div className="champion-card gold">
          <h3>🥇 CAMPEÃO</h3>
          <p className="name">{tournament.champion?.name}</p>
          <p className="prize">R$ {championPlayer?.earnings.toFixed(2)} + 1 Cerveja Louvada</p>
        </div>

        <div className="champion-card silver">
          <h3>🥈 VICE-CAMPEÃO</h3>
          <p className="name">{tournament.runnerUp?.name}</p>
          <p className="prize">R$ {runnerUpPlayer?.earnings.toFixed(2)} + 1 Cerveja Louvada</p>
        </div>
      </section>

      {/* Artilheiro */}
      {tournament.topScorer && (
        <section className="top-scorer">
          <div className="scorer-card">
            <h3>⚽ ARTILHEIRO DO TORNEIO</h3>
            <p className="name">{tournament.topScorer.name}</p>
            <p className="stats">{tournament.topScorer.goals} gols</p>
            <p className="prize">1 Cerveja Louvada</p>
          </div>
        </section>
      )}

      {/* Rankings Finais */}
      <section className="final-rankings">
        <h3>📊 Rankings Finais</h3>
        
        <div className="rankings-grid">
          <div className="ranking-box">
            <h4>🏅 Classificação por Vitórias</h4>
            <ol>
              {sortedByWins.map((p, idx) => (
                <li key={p.id} className={idx === 0 ? 'first' : ''}>
                  {p.name} - {p.wins} vitória(s)
                </li>
              ))}
            </ol>
          </div>

          <div className="ranking-box">
            <h4>⚽ Artilharia</h4>
            <ol>
              {sortedByGoals.map((p, idx) => (
                <li key={p.id} className={idx === 0 ? 'first' : ''}>
                  {p.name} - {p.goals} gol(s)
                </li>
              ))}
            </ol>
          </div>

          <div className="ranking-box">
            <h4>💰 Premiação Total</h4>
            <ol>
              {sortedByEarnings.map((p, idx) => (
                <li key={p.id} className={idx < 2 ? 'first' : ''}>
                  {p.name} - R$ {p.earnings.toFixed(2)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Estatísticas Gerais */}
      <section className="tournament-stats">
        <h3>📈 Estatísticas do Torneio</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <p className="stat-label">Total de Jogadores</p>
            <p className="stat-value">{confirmedPlayers.length}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Prêmio Total</p>
            <p className="stat-value">R$ {tournament.totalPrize?.toFixed(2)}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Total de Gols</p>
            <p className="stat-value">{confirmedPlayers.reduce((sum, p) => sum + p.goals, 0)}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Cerveja Louvada</p>
            <p className="stat-value">4 unidades 🍺</p>
          </div>
        </div>
      </section>

      <section className="congratulations">
        <p className="congrats-msg">
          🎉 Parabéns a todos os participantes! 🎉
        </p>
        <p className="congrats-submsg">
          Obrigado por tornar este torneio épico!
        </p>
      </section>
    </div>
  );
}

export default TournamentFinished;
