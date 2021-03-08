import { useEffect, useState } from 'react';

const BOARD_SIZE = 8;
const MINE_COUNT = 10;
const BlockState = {
  safe: 'safe',
  boom: 'boom',
};

function Ceil({ value, isFirstClicked, block, setIsFirstClicked, setClickIndex, isGameOver }) {
  return (
    <div
      key={value}
      style={{
        width: 35,
        height: 35,
        border: '#818f9c 1px solid',
        backgroundColor: isGameOver ? '#ff0000' : '#b1cbe3',
      }}
      onClick={() => {
        if (!isFirstClicked) setIsFirstClicked(true);
        setClickIndex(value);
        console.log(getAdjacentIndex(value, BOARD_SIZE));
      }}
    >
      {value}
    </div>
  );
}

function createOneRow(
  rowCount,
  elementInOneRow,
  block,
  isFirstClicked,
  setIsFirstClicked,
  setClickIndex,
  isGameOver,
) {
  return (
    <div style={{ display: 'flex' }}>
      {[...Array(elementInOneRow).keys()].map((count) => (
        <Ceil
          value={count + rowCount * elementInOneRow}
          isFirstClicked={isFirstClicked}
          block={block}
          setIsFirstClicked={setIsFirstClicked}
          setClickIndex={setClickIndex}
          isGameOver={isGameOver}
        />
      ))}
    </div>
  );
}

function Board({ row, column }) {
  const [isFirstClicked, setIsFirstClicked] = useState(false);
  const [clickIndex, setClickIndex] = useState(null);
  const [block, setBlock] = useState({});
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isFirstClicked) {
      console.log('create mine');
      setBlock(initialBlock(BOARD_SIZE));
    }
  }, [isFirstClicked]);

  useEffect(() => {
    if (block[clickIndex] === BlockState.boom) {
      setIsGameOver(true);
    }
  }, [block, clickIndex]);

  // useEffect(() => {
  //   if (block[clickIndex] === BlockState.safe) {

  //   }
  // },[])

  console.log(clickIndex);
  console.log(block);

  return (
    <div style={{ margin: 50 }}>
      {[...Array(row).keys()].map((rowCount) =>
        createOneRow(rowCount, column, block, isFirstClicked, setIsFirstClicked, setClickIndex, isGameOver),
      )}
    </div>
  );
}

function getAdjacentMinesCount(targetIndex, block) {}

function getAdjacentIndex(targetIndex, size) {
  const inWhichColumn = targetIndex % size;
  const inWhichRow = targetIndex / size;
  const fullPositionValue = [
    targetIndex - size - 1, // 0 leftTop
    targetIndex - size, // 1 top
    targetIndex - size + 1, // 2 rightTop
    targetIndex - 1, // 3 left
    targetIndex + 1, // 4 right
    targetIndex + size - 1, // 5 leftBottom
    targetIndex + size, // 6 bottom
    targetIndex + size + 1, // 7 rightBottom
  ];

  if (inWhichColumn === 0) {
    [0, 3, 5].map((noNeedPosition) => (fullPositionValue[noNeedPosition] = null));
  }
  if (inWhichColumn === size - 1) {
    [2, 4, 7].map((notNeedPosition) => (fullPositionValue[notNeedPosition] = null));
  }
  if (inWhichRow === 0) {
    [0, 1, 2].map((notNeedPosition) => (fullPositionValue[notNeedPosition] = null));
  }
  if (inWhichRow === size - 1) {
    [5, 6, 7].map((notNeedPosition) => (fullPositionValue[notNeedPosition] = null));
  }

  return fullPositionValue.filter(
    (positionValue) => positionValue !== null && positionValue < size * size && positionValue > -1,
  );
}

function getUniqueRandom(count, max) {
  const uniqueNumber = new Set();
  while (uniqueNumber.size !== count) {
    uniqueNumber.add(Math.floor(Math.random() * max));
  }
  return [...uniqueNumber];
}

function initialBlock(size) {
  const allSafeState = [...Array(size * size).keys()].fill(BlockState.safe);
  const mineIndexes = getUniqueRandom(MINE_COUNT, BOARD_SIZE * BOARD_SIZE);
  mineIndexes.map((mineIndex) => (allSafeState[mineIndex] = BlockState.boom));
  return { ...allSafeState };
}

function Minesweeper() {
  return <Board row={BOARD_SIZE} column={BOARD_SIZE} />;
}

export default Minesweeper;
