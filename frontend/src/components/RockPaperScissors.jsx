import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './RockPaperScissors.css';

const RockPaperScissors = () => {
  const { updateGameStats } = useAuth();
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
          setStatus("Series ended in a draw!");
          await updateGameStats('rps', 'draw');
        } else {
          const finalWinner = updatedScores.player > updatedScores.computer ? 'player' : 'computer';
          setStatus(`${finalWinner === 'player' ? 'You' : 'Computer'} wins the series!`);
          await updateGameStats('rps', finalWinner === 'player' ? 'win' : 'lose');
        }
      };
      updateStats();
    } else {
      // Current match is over but series continues
      setStatus(`Match ${matchNumber}: ${matchWinner === 'draw' ? "It's a draw!" : `${matchWinner === 'player' ? 'You' : 'Computer'} wins!`} (Score: You: ${updatedScores.player}, Computer: ${updatedScores.computer})`);
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
      <h1>Rock Paper Scissors (Best of 3)</h1>
      
      <div className="score-board">
        <div className="score-display">
          <span className="match-info">Match {matchNumber}/3</span>
          <span className="score">You {scores.player} - {scores.computer} CPU</span>
        </div>
        {status && <div className="status">{
          gameOver 
            ? status 
            : result 
              ? `${result === 'draw' ? "Draw" : result === 'player' ? "You win" : "CPU wins"}`
              : ''
        }</div>}
      </div>
      
      <div className="choices">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`choice-btn ${choice}`}
            onClick={() => handleChoice(choice)}
            disabled={playerChoice !== null && !result || gameOver}
          >
            {choice}
          </button>
        ))}
      </div>

      {playerChoice && (
        <div className="result">
          <div className="choices-display">
            <div className="choice">
              <h3>Your Choice</h3>
              <div className={`choice-icon ${playerChoice}`}>{playerChoice}</div>
            </div>
            <div className="choice">
              <h3>Computer's Choice</h3>
              <div className={`choice-icon ${computerChoice}`}>{computerChoice}</div>
            </div>
          </div>
          <div className={`result-message ${result}`}>
            {result === 'draw' ? "It's a draw!" : `You ${result === 'player' ? 'win' : 'lose'}!`}
          </div>
          {!gameOver && result && (
            <button className="next-round" onClick={startNextMatch}>
              Next Match
            </button>
          )}
        </div>
      )}

      <div className="game-controls">
        <button className="reset-button" onClick={resetGame}>
          New Game
        </button>
        {gameOver && (
          <button className="new-match-button" onClick={resetGame}>
            New Match Series
          </button>
        )}
      </div>
    </div>
  );
};

export default RockPaperScissors; 