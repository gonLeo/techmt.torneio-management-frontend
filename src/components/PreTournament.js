import React, { useState } from 'react';

function PreTournament({ players, tournament, onRefresh }) {
  const [accordionOpen, setAccordionOpen] = useState({});
  const [authCode, setAuthCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [message, setMessage] = useState('');

  const toggleAccordion = (section) => {
    setAccordionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const togglePlayerConfirmation = async (playerId) => {
    try {
      await fetch(`http://localhost:5000/api/players/${playerId}/toggle`, {
        method: 'POST'
      });
      onRefresh();
    } catch (error) {
      console.error('Erro ao confirmar jogador:', error);
    }
  };

  const handleStartTournament = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournament/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}${data.byePlayer ? ` | Bye: ${data.byePlayer}` : ''}`);
        setShowAuthModal(false);
        setTimeout(() => onRefresh(), 1000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao iniciar torneio');
    }
  };

  const confirmedPlayers = players.filter(p => p.confirmed);

  return (
    <div className="pre-tournament">
      {/* Accordion de Regras */}
      <section className="rules-section">
        <h2>📋 Informações do Torneio</h2>
        
        <div className="accordion">
          <div className="accordion-item">
            <button 
              className="accordion-header" 
              onClick={() => toggleAccordion('rules')}
            >
              Regras básicas do torneio {accordionOpen.rules ? '▼' : '▶'}
            </button>
            {accordionOpen.rules && (
              <div className="accordion-content">
                <ul>
                  <li>Formato: eliminatória direta (mata-mata)</li>
                  <li>Jogos de ida e volta em todas as fases, exceto final (jogo único)</li>
                  <li>Pré-rodada (se necessário) também é jogo único</li>
                  <li>Tempo de partida: 6 minutos por tempo</li>
                  <li>Seleção de times livre (ambos podem escolher o mesmo time)</li>
                  <li>Confronto pode ser presencial ou online</li>
                </ul>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <button 
              className="accordion-header" 
              onClick={() => toggleAccordion('preliminary')}
            >
              Sistema de Pré-Rodada (Qualificação) {accordionOpen.preliminary ? '▼' : '▶'}
            </button>
            {accordionOpen.preliminary && (
              <div className="accordion-content">
                <p><strong>O torneio usa o sistema tradicional de pré-rodada:</strong></p>
                <ul>
                  <li>Se o número de inscritos não for potência de 2 (4, 8, 16...), haverá uma Rodada 0</li>
                  <li>Alguns jogadores são sorteados para disputar confrontos de qualificação (jogo único)</li>
                  <li>Os demais avançam direto para a Fase 1 (bye da pré-rodada)</li>
                  <li>Após a pré-rodada, o torneio segue sempre com número par de jogadores</li>
                </ul>
                <p><strong>Exemplos:</strong></p>
                <ul>
                  <li>5 jogadores → 1 confronto de pré → 4 na Fase 1 (semifinais)</li>
                  <li>10 jogadores → 2 confrontos de pré → 8 na Fase 1 (quartas)</li>
                  <li>11 jogadores → 3 confrontos de pré → 8 na Fase 1 (quartas)</li>
                </ul>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <button 
              className="accordion-header" 
              onClick={() => toggleAccordion('hybrid')}
            >
              Híbrido – como funciona {accordionOpen.hybrid ? '▼' : '▶'}
            </button>
            {accordionOpen.hybrid && (
              <div className="accordion-content">
                <p>Se os dois jogadores estiverem presentes: jogam local.</p>
                <p>Se os dois estiverem remotos: jogam online.</p>
                <p>Se um estiver local e outro remoto: jogam online.</p>
                <p><strong>Flexível e pensado para encaixar todos!</strong></p>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <button 
              className="accordion-header" 
              onClick={() => toggleAccordion('prizes')}
            >
              Taxa e premiações {accordionOpen.prizes ? '▼' : '▶'}
            </button>
            {accordionOpen.prizes && (
              <div className="accordion-content">
                <ul>
                  <li><strong>Taxa de inscrição:</strong> R$ 10 por jogador</li>
                  <li><strong>Campeão:</strong> 70% do total + 1 cerveja Louvada</li>
                  <li><strong>Vice:</strong> 30% do total + 1 cerveja Louvada</li>
                  <li><strong>Bônus:</strong> R$ 2 por confronto vencido</li>
                  <li><strong>Artilheiro do torneio:</strong> 1 cerveja Louvada</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Jogadores */}
      <section className="players-section">
        <h2>👥 Jogadores - Quem topa?</h2>
        <p className="info">
          {confirmedPlayers.length} jogador(es) confirmado(s) 
          {tournament && ` | Prêmio total: R$ ${tournament.totalPrize.toFixed(2)}`}
        </p>
        
        <div className="players-grid">
          {players.map(player => (
            <div key={player.id} className={`player-card ${player.confirmed ? 'confirmed' : ''}`}>
              <span className="player-name">{player.name}</span>
              <button 
                className={`btn-toggle ${player.confirmed ? 'active' : ''}`}
                onClick={() => togglePlayerConfirmation(player.id)}
              >
                {player.confirmed ? '✓ Eu topo' : 'Eu topo'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Simulação de Chaveamento */}
      <section className="bracket-preview">
        <h2>🗓️ Chaveamento (Simulação)</h2>
        <p className="warning">
          ⚠️ Chaveamento não oficial. Apenas simulação. O sorteio oficial será feito no dia do torneio.
        </p>
        {confirmedPlayers.length >= 2 ? (
          <div className="simulation-info">
            <p>Com {confirmedPlayers.length} jogadores confirmados, teremos:</p>
            <p><strong>{Math.floor(confirmedPlayers.length / 2)} confrontos na primeira fase</strong></p>
            {confirmedPlayers.length % 2 !== 0 && (
              <p>Um jogador receberá <strong>bye</strong> e avançará automaticamente.</p>
            )}
          </div>
        ) : (
          <p>Aguardando confirmações...</p>
        )}
      </section>

      {/* Botão Iniciar Torneio */}
      <section className="start-section">
        <button 
          className="btn-start-tournament"
          onClick={() => setShowAuthModal(true)}
          disabled={confirmedPlayers.length < 2}
        >
          🎮 Iniciar Torneio (Sortear Chaves)
        </button>
        {confirmedPlayers.length < 2 && (
          <p className="error">Mínimo de 2 jogadores necessários</p>
        )}
      </section>

      {/* Modal de Autorização */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Código de Autorização</h3>
            <p>Digite o código para iniciar o torneio:</p>
            <input 
              type="password" 
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Digite o código"
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleStartTournament} className="btn-confirm">Confirmar</button>
              <button onClick={() => setShowAuthModal(false)} className="btn-cancel">Cancelar</button>
            </div>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default PreTournament;
