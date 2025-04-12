import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SnakeGame.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const { updateGameStats } = useAuth();
  const navigate = useNavigate();
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef(null);
  const canvasRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastDirectionRef = useRef('RIGHT');
  const touchThreshold = 30; // Minimum distance for swipe detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768; // Define isMobile
  const isDarkMode = false; // Define isDarkMode

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    
    return newFood;
  };

  const checkCollision = (head) => {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Check self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  };

  const moveSnake = () => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      // Only make one call to updateGameStats
      if (score > 0) {
        console.log('Game over! Final score:', score);
        updateGameStats('snake', 'highScore', score);
      } else {
        console.log('Game over! Score was 0');
        updateGameStats('snake', 'gamesPlayed');
      }
      return;
    }

    const newSnake = [head];
    
    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 1);
      setFood(generateFood());
      newSnake.push(...snake);
    } else {
      newSnake.push(...snake.slice(0, -1));
    }

    setSnake(newSnake);
  };

  const handleKeyPress = (e) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') {
          setDirection('UP');
          e.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (direction !== 'UP') {
          setDirection('DOWN');
          e.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') {
          setDirection('LEFT');
          e.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (direction !== 'LEFT') {
          setDirection('RIGHT');
          e.preventDefault();
        }
        break;
      case ' ':
        setIsPaused(prev => !prev);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleTouchStart = (e) => {
    if (gameOver) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    lastDirectionRef.current = direction;
  };

  const handleTouchMove = (e) => {
    if (gameOver || isPaused) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only change direction if the swipe distance exceeds the threshold
    if (Math.abs(deltaX) > touchThreshold || Math.abs(deltaY) > touchThreshold) {
      // Determine swipe direction based on the larger delta
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && lastDirectionRef.current !== 'LEFT') {
          setDirection('RIGHT');
        } else if (deltaX < 0 && lastDirectionRef.current !== 'RIGHT') {
          setDirection('LEFT');
        }
      } else {
        if (deltaY > 0 && lastDirectionRef.current !== 'UP') {
          setDirection('DOWN');
        } else if (deltaY < 0 && lastDirectionRef.current !== 'DOWN') {
          setDirection('UP');
        }
      }
      // Reset touch start position to prevent multiple direction changes
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = { x: 0, y: 0 };
  };

  const handleDirectionButton = (newDirection) => {
    if (gameOver || isPaused) return;
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setDirection(newDirection);
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });
    
    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [direction, gameOver]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        moveSnake();
        drawGame();
      }, INITIAL_SPEED);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [snake, food, direction, gameOver, isPaused]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div className={`snake-game ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="game-header">
        <h2>Snake Game</h2>
        <div className="score">Score: {score}</div>
      </div>
      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="game-canvas"
        />
        <div className="mobile-controls">
          <button className="control-button" onClick={() => handleDirectionButton('UP')}>↑</button>
          <div className="horizontal-controls">
            <button className="control-button" onClick={() => handleDirectionButton('LEFT')}>←</button>
            <button className="control-button" onClick={() => handleDirectionButton('RIGHT')}>→</button>
          </div>
          <button className="control-button" onClick={() => handleDirectionButton('DOWN')}>↓</button>
        </div>
      </div>
      <div className="game-controls">
        <button className="control-button" onClick={handlePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button className="control-button" onClick={handleRestart}>
          Restart
        </button>
      </div>
      <div className="instructions">
        {isMobile ? (
          <p>Swipe or use the buttons to move. Collect food to grow!</p>
        ) : (
          <p>Use arrow keys to move. Collect food to grow!</p>
        )}
      </div>
    </div>
  );
};

export default SnakeGame; 