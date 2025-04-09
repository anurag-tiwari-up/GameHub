import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Game.css';

const Game = ({ mode, onBack }) => {
  const { updateGameStats } = useAuth();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('');
  const [matchNumber, setMatchNumber] = useState(1);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(square => square !== null)) {
      return 'draw';
    }

    return null;
  };

  const getBotMove = (squares) => {
    // First, try to win
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const boardCopy = [...squares];
        boardCopy[i] = 'O';
        if (calculateWinner(boardCopy) === 'O') {
          return i;
        }
      }
    }

    // Second, block player's winning move
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const boardCopy = [...squares];
        boardCopy[i] = 'X';
        if (calculateWinner(boardCopy) === 'X') {
          return i;
        }
      }
    }

    // Try to take center
    if (!squares[4]) {
      return 4;
    }

    // Take any corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !squares[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => !squares[i]);
    if (availableSides.length > 0) {
      return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    return null;
  };

  useEffect(() => {
    if (mode === 'bot' && !xIsNext && !winner && !gameOver) {
      const timer = setTimeout(() => {
        const botMove = getBotMove(board);
        if (botMove !== null) {
          const newBoard = [...board];
          newBoard[botMove] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [board, xIsNext, winner, mode, gameOver]);

  const startNextMatch = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setMatchNumber(prev => prev + 1);
  };

  const updateMatchScore = (matchWinner) => {
    if (matchWinner !== 'draw') {
      setScores(prev => ({
        ...prev,
        [matchWinner]: prev[matchWinner] + 1
      }));
    }
  };

  useEffect(() => {
    const gameWinner = calculateWinner(board);
    if (gameWinner && !winner) {
      setWinner(gameWinner);
      updateMatchScore(gameWinner);

      // Check if the match series is over
      const updatedScores = {
        ...scores,
        [gameWinner]: gameWinner !== 'draw' ? scores[gameWinner] + 1 : scores[gameWinner]
      };

      if (updatedScores.X === 2 || updatedScores.O === 2 || matchNumber === 3) {
        // Game series is over
        setGameOver(true);
        const updateStats = async () => {
          const finalWinner = updatedScores.X > updatedScores.O ? 'X' : 'O';
          if (updatedScores.X === updatedScores.O) {
            setStatus("Series ended in a draw!");
            await updateGameStats('tictactoe', 'draw');
          } else {
            setStatus(`${finalWinner} wins the series!`);
            if ((finalWinner === 'X' && mode === 'bot') || 
                (finalWinner === 'X' && mode === 'human' && xIsNext) || 
                (finalWinner === 'O' && mode === 'human' && !xIsNext)) {
              await updateGameStats('tictactoe', 'win');
            } else {
              await updateGameStats('tictactoe', 'lose');
            }
          }
        };
        updateStats();
      } else {
        // Current match is over but series continues
        setStatus(`Match ${matchNumber}: ${gameWinner === 'draw' ? "It's a draw!" : `${gameWinner} wins!`} (Score: X: ${updatedScores.X}, O: ${updatedScores.O})`);
      }
    } else if (!gameWinner) {
      setStatus(`Match ${matchNumber} - Next player: ${xIsNext ? 'X' : 'O'} (Score: X: ${scores.X}, O: ${scores.O})`);
    }
  }, [board, xIsNext, updateGameStats, mode, winner, scores, matchNumber]);

  const handleClick = (i) => {
    if (winner || board[i] || (mode === 'bot' && !xIsNext) || gameOver) return;

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setStatus('');
    setMatchNumber(1);
    setScores({ X: 0, O: 0 });
    setGameOver(false);
  };

  const renderSquare = (i) => (
    <button
      className="square"
      onClick={() => handleClick(i)}
      disabled={winner || board[i] || (mode === 'bot' && !xIsNext) || gameOver}
    >
      {board[i]}
    </button>
  );

  return (
    <div className="game">
      <h2>Tic-Tac-Toe (Best of 3)</h2>
      <div className="status">{status}</div>
      <div className="board">
        {Array(9).fill(null).map((_, i) => (
          <div key={i}>
            {renderSquare(i)}
          </div>
        ))}
      </div>
      <div className="game-controls">
        {winner && !gameOver && (
          <button className="control-button" onClick={startNextMatch}>
            Next Match
          </button>
        )}
        <button className="control-button" onClick={resetGame}>
          New Game
        </button>
        <button className="control-button" onClick={onBack}>
          Back to Menu
        </button>
      </div>
      <div className="score-board">
        <h3>Score</h3>
        <p>X: {scores.X} - O: {scores.O}</p>
        <p>Match {matchNumber} of 3</p>
      </div>
    </div>
  );
};

export default Game; 