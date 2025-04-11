import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './RockPaperScissors.css';

const RockPaperScissors = () => {
  const { updateGameStats } = useAuth();
  const navigate = useNavigate();
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [matchNumber, setMatchNumber] = useState(1);
  const [scores, setScores] = useState({ player: 0, computer: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');

  const choices = ['rock', 'paper', 'scissors'];

  const getComputerChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player';
    }
    return 'computer';
  };

  const updateMatchScore = (matchWinner) => {
    if (matchWinner !== 'draw') {
      setScores(prev => ({
        ...prev,
        [matchWinner]: prev[matchWinner] + 1
      }));
    }
  };

  const startNextMatch = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setMatchNumber(prev => prev + 1);
  };

  const handleChoice = async (choice) => {
    if (gameOver) return;

    const computer = getComputerChoice();
    setPlayerChoice(choice);
    setComputerChoice(computer);
    
    const matchWinner = determineWinner(choice, computer);
    setResult(matchWinner);
    updateMatchScore(matchWinner);

    // Check if the match series is over
    const updatedScores = {
      ...scores,
      [matchWinner]: matchWinner !== 'draw' ? scores[matchWinner] + 1 : scores[matchWinner]
    };

    if (updatedScores.player === 2 || updatedScores.computer === 2 || matchNumber === 3) {
      // Game series is over
      setGameOver(true);
      const updateStats = async () => {
        if (updatedScores.player === updatedScores.computer) {
          setStatus("Game Over - Series ended in a draw!");
          await updateGameStats('rps', 'draw');
        } else {
          const finalWinner = updatedScores.player > updatedScores.computer ? 'player' : 'computer';
          setStatus(`Game Over - ${finalWinner === 'player' ? 'You' : 'Computer'} win the series! (Final Score: You: ${updatedScores.player}, Computer: ${updatedScores.computer})`);
          await updateGameStats('rps', finalWinner === 'player' ? 'win' : 'lose');
        }
      };
      updateStats();
    } else {
      // Current match is over but series continues
      setStatus(`Match ${matchNumber} complete - Starting next match in 1 second...`);
      setTimeout(startNextMatch, 1000);
    }
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setMatchNumber(1);
    setScores({ player: 0, computer: 0 });
    setGameOver(false);
    setStatus('');
  };

  return (
    <div className="rps-game">
      <button 
        className="back-button"
        onClick={() => navigate('/')}
      >
        ← Back to Games
      </button>
      <h2>Rock Paper Scissors (Best of 3)</h2>
      
      <div className="status">{status || `Match ${matchNumber} of 3 - Your turn`}</div>
      
      <div className="choices">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`choice-btn ${choice}`}
            onClick={() => handleChoice(choice)}
            disabled={playerChoice !== null || gameOver}
          >
            {choice}
          </button>
        ))}
      </div>

      {playerChoice && (
        <div className="result">
          <div className="choices-display">
            <div className="choice">
              <h3>You</h3>
              <div className={`choice-icon ${playerChoice}`}>{playerChoice}</div>
            </div>
            <div className="choice">
              <h3>Computer</h3>
              <div className={`choice-icon ${computerChoice}`}>{computerChoice}</div>
            </div>
          </div>
          <div className={`result-message ${result}`}>
            {result === 'draw' ? "It's a draw!" : `You ${result === 'player' ? 'win' : 'lose'}!`}
          </div>
        </div>
      )}

      <div className="game-controls">
        {gameOver && (
          <>
            <button className="control-button" onClick={resetGame}>
              New Game
            </button>
            <button className="control-button" onClick={() => navigate('/')}>
              Back to Menu
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors; 