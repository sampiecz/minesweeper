import React, { useState, useEffect } from 'react';
import './styles.css';

const MineSweeper = () => {
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [mineCount, setMineCount] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [tilesSuccessfullyExposed, setTilesSuccessfullyExposed] = useState(0);
  const [gameStatus, setGameStatus] = useState(null);

  const handleStartButtonClick = () => {
    generateTiles();
    setTilesSuccessfullyExposed(0);
    setGameStatus(null);
    setPlaying(true);
  };

  function* range(n) {
    for (let i = 0; i < n; i++) {
      yield i;
    }
  }

  const generateTiles = () => {
    let grid = [];
    for (const x of range(width)) {
      grid.push([]);
      for (const _ of range(height)) {
        grid[x].push({ value: "-", hidden: true });
      }
    }
    setTiles(grid);
  };

  const generateMines = () => {
    if (tiles.length === 0) return;

    const grid = tiles.map(row => row.map(tile => ({ ...tile })));

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (grid[x][y].value === "-") {
        grid[x][y].value = "*";
        minesPlaced++;
      }
    }
    setTiles(grid);
  };

  const getTotalTiles = () => width * height;

  const areTilesFullyExposed = () => {
    const totalNonMineTiles = getTotalTiles() - mineCount;
    return tilesSuccessfullyExposed === totalNonMineTiles;
  };

  const getSurroundingTiles = (x, y) => {
    const surroundingTiles = [
      [x - 1, y + 1],
      [x + 1, y + 1],
      [x - 1, y - 1],
      [x + 1, y - 1],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y],
      [x - 1, y],
    ];
    return surroundingTiles.filter(([tx, ty]) =>
      0 <= tx && tx < width && 0 <= ty && ty < height
    );
  };

  const countSurroundingMines = (x, y) => {
    const surroundingTiles = getSurroundingTiles(x, y);
    let surroundingMineCount = 0;
    for (const [tx, ty] of surroundingTiles) {
      if (tiles[tx] && tiles[tx][ty] && tiles[tx][ty].value === "*") {
        surroundingMineCount++;
      }
    }
    return { surroundingMineCount, surroundingTiles };
  };

  const revealTiles = (x, y) => {
    if (tiles[x][y].hidden === false) return;

    const newTiles = tiles.map(row => row.map(tile => ({ ...tile })));

    if (newTiles[x][y].value === "*") {
      newTiles[x][y].hidden = false;
      setTiles(newTiles);
      setGameStatus("lost");
      return;
    }

    const queue = [{ x, y }];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const tile = newTiles[x][y];

      if (!tile.hidden) continue;

      const { surroundingMineCount, surroundingTiles } = countSurroundingMines(x, y);

      newTiles[x][y].value = `${surroundingMineCount}`;
      newTiles[x][y].hidden = false;
      setTilesSuccessfullyExposed(prevCount => prevCount + 1);
      setTiles(newTiles);

      if (surroundingMineCount === 0) {
        for (const [tx, ty] of surroundingTiles) {
          if (newTiles[tx] && newTiles[tx][ty] && newTiles[tx][ty].hidden) {
            queue.push({ x: tx, y: ty });
          }
        }
      }
    }
  };

  const handleTileClick = (x, y) => {
    if (gameStatus === null) {
      revealTiles(x, y);
    }
  };

  useEffect(() => {
    if (playing) {
      generateMines();
    }
  }, [playing]);

  useEffect(() => {
    if (tiles.length > 0 && !gameStatus) {
      if (areTilesFullyExposed()) {
        setGameStatus("won");
      }
    }
  }, [tiles, tilesSuccessfullyExposed, gameStatus]);

  useEffect(() => {
    if (gameStatus === "lost") {
      const revealAllMines = () => {
        const newTiles = tiles.map(row => row.map(tile => ({
          ...tile,
          hidden: tile.value === "*" ? false : tile.hidden
        })));
        setTiles(newTiles);
      };

      revealAllMines();
      setTimeout(() => {
        alert("Game Over!");
        setPlaying(false);
      }, 500);
    } else if (gameStatus === "won") {
      alert("Congratulations, You Won!");
      setPlaying(false);
    }
  }, [gameStatus]);

  const getTileClass = (value, hidden) => {
    if (hidden) {
      return "col hidden";
    } else if (value === "*") {
      return "col mine";
    } else if (value === "-") {
      return "col empty";
    } else {
      return `col number number-${value}`;
    }
  };

  return (
    <div className={playing ? "grid" : "start-page"}>
      {playing ? (
        <>
          {tiles.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map(({ value, hidden }, columnIndex) => (
                <div
                  key={columnIndex}
                  className={getTileClass(value, hidden)}
                  onClick={() => handleTileClick(rowIndex, columnIndex)}
                >
                  {hidden ? '-' : value}
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <>
          <h1>Minesweeper</h1>
          <p>Welcome to Minesweeper! The goal is to uncover all the tiles without triggering any mines. Click on a tile to reveal what's underneath. If you reveal a mine, the game is over. If you uncover all the non-mine tiles, you win!</p>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            placeholder="Width (e.g., 10)"
          />
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="Height (e.g., 10)"
          />
          <input
            type="number"
            value={mineCount}
            onChange={(e) => setMineCount(Number(e.target.value))}
            placeholder="Number of Mines"
          />
          <button onClick={handleStartButtonClick}>Start Game</button>
        </>
      )}
    </div>
  );
};

export default MineSweeper;

