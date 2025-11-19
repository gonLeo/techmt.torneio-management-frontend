import React, { useState } from 'react';

function TournamentFinished({ tournament, players, onRefresh }) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [message, setMessage] = useState('');
  
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

  const generateStoryImage = () => {
    if (!window.html2canvas) {
      alert('Erro ao carregar a biblioteca de geração de imagem. Recarregue a página.');
      return;
    }

    // Criar elemento temporário com o conteúdo
    const storyContent = document.createElement('div');
    storyContent.style.width = '1080px';
    storyContent.style.height = '1920px';
    storyContent.style.position = 'fixed';
    storyContent.style.left = '-9999px';
    storyContent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    storyContent.style.padding = '60px 40px';
    storyContent.style.fontFamily = 'Arial, sans-serif';
    storyContent.style.color = 'white';
    storyContent.style.boxSizing = 'border-box';

    storyContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-size: 72px; margin: 0 0 20px 0; text-shadow: 3px 3px 6px rgba(0,0,0,0.3);">🏆 EA FC 24 🏆</h1>
        <h2 style="font-size: 48px; margin: 0; font-weight: normal; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">TORNEIO FINALIZADO</h2>
      </div>

      <div style="background: rgba(255,215,0,0.95); padding: 40px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h3 style="font-size: 56px; margin: 0 0 20px 0; color: #333;">🥇 CAMPEÃO</h3>
        <p style="font-size: 64px; margin: 10px 0; font-weight: bold; color: #000;">${tournament.champion?.name}</p>
        <p style="font-size: 48px; margin: 10px 0; color: #333;">R$ ${championPlayer?.earnings.toFixed(2)}</p>
        <p style="font-size: 40px; margin: 0; color: #444;">+ 1 Cerveja Louvada 🍺</p>
      </div>

      <div style="background: rgba(192,192,192,0.95); padding: 40px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h3 style="font-size: 56px; margin: 0 0 20px 0; color: #333;">🥈 VICE-CAMPEÃO</h3>
        <p style="font-size: 64px; margin: 10px 0; font-weight: bold; color: #000;">${tournament.runnerUp?.name}</p>
        <p style="font-size: 48px; margin: 10px 0; color: #333;">R$ ${runnerUpPlayer?.earnings.toFixed(2)}</p>
        <p style="font-size: 40px; margin: 0; color: #444;">+ 1 Cerveja Louvada 🍺</p>
      </div>

      ${tournament.topScorer ? `
      <div style="background: rgba(255,255,255,0.95); padding: 35px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h3 style="font-size: 48px; margin: 0 0 15px 0; color: #667eea;">⚽ ARTILHEIRO</h3>
        <p style="font-size: 56px; margin: 10px 0; font-weight: bold; color: #333;">${tournament.topScorer.name}</p>
        <p style="font-size: 52px; margin: 0; color: #555;">${tournament.topScorer.goals} gols</p>
      </div>
      ` : ''}

      <div style="background: rgba(255,255,255,0.9); padding: 35px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <h3 style="font-size: 48px; margin: 0 0 25px 0; color: #667eea; text-align: center;">📊 ESTATÍSTICAS</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 36px; color: #333;">
          <div><strong>Jogadores:</strong> ${confirmedPlayers.length}</div>
          <div><strong>Total de Gols:</strong> ${confirmedPlayers.reduce((sum, p) => sum + p.goals, 0)}</div>
          <div style="grid-column: 1 / -1;"><strong>Prêmio Total:</strong> R$ ${tournament.totalPrize?.toFixed(2)}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <p style="font-size: 52px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎉 PARABÉNS! 🎉</p>
      </div>

      <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center;">
        <p style="font-size: 28px; margin: 0; opacity: 0.9;">${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    `;

    document.body.appendChild(storyContent);

    // Gerar imagem com html2canvas
    window.html2canvas(storyContent, {
      scale: 2,
      backgroundColor: null,
      logging: false,
      width: 1080,
      height: 1920
    }).then(canvas => {
      // Converter para blob e baixar
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `torneio-ea-fc24-${new Date().getTime()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(storyContent);
      });
    });
  };

  const handleResetTournament = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setShowResetModal(false);
          onRefresh();
        }, 1000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao resetar torneio');
    }
  };

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

      {/* Botão Compartilhar */}
      <section className="share-section">
        <button className="btn-share" onClick={generateStoryImage}>
          📸 Compartilhar
        </button>
      </section>

      <section className="congratulations">
        <p className="congrats-msg">
          🎉 Parabéns a todos os participantes! 🎉
        </p>
        <p className="congrats-submsg">
          Obrigado por tornar este torneio épico!
        </p>
      </section>

      {/* Botão Iniciar Novo Torneio */}
      <section className="reset-section">
        <button className="btn-reset" onClick={() => setShowResetModal(true)}>
          🔄 Iniciar Novo Torneio
        </button>
      </section>

      {/* Modal de Confirmação de Reset */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Resetar Torneio</h3>
            <p>Digite o código de autorização para iniciar um novo torneio:</p>
            <p className="warning-text">
              <strong>Atenção:</strong> Todos os dados do torneio atual serão perdidos!
            </p>
            
            <div className="form-group">
              <input 
                type="password" 
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Digite o código"
                autoFocus
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={handleResetTournament} className="btn-confirm">Confirmar Reset</button>
              <button onClick={() => setShowResetModal(false)} className="btn-cancel">Cancelar</button>
            </div>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentFinished;
