import { useEffect, useState, useMemo, useRef } from 'react';

const BOARD_SIZE = 8;
const MINE_COUNT = 10;

function getAutoOpenCeilIndex(block, clickIndex) {
  const blockWithWalked = block.map((blockItem) => ({ ...blockItem, walked: false }));
  return openCeil(clickIndex);

  function openCeil(index) {
    const ceil = blockWithWalked[index];
    if (ceil.walked || ceil.aroundMines < 0) return [];
    ceil.walked = true;
    if (ceil.aroundMines > 0) return [index];
    return [
      index,
      ...getAdjacentIndex(index, BOARD_SIZE).reduce((lastIndexes, ceilIndex) => {
        return [...lastIndexes, ...openCeil(ceilIndex)];
      }, []),
    ];
  }
}

function Ceil({ value, isFirstClicked, block, setBlock, setIsFirstClicked, setClickIndex, isGameOver }) {
  const blockState = block?.[value]?.blockState ?? '';
  const aroundMines = block?.[value]?.aroundMines ?? '';

  function handleOnClick() {
    if (!isFirstClicked) {
      setIsFirstClicked(true);
    }
    setClickIndex(value);
  }

  return (
    <div
      key={value}
      style={{
        width: 40,
        height: 40,
        border: '#818f9c 1px solid',
        backgroundColor: isGameOver ? '#ff0000' : '#b1cbe3',
      }}
      onClick={() => {
        handleOnClick();
      }}
    >
      <div style={{ fontWeight: 700, color: '#ff0000' }}>
        {/* {value} */}
        {blockState === 'open' ? aroundMines : ''}
      </div>
    </div>
  );
}

function createOneRow(
  rowCount,
  elementInOneRow,
  block,
  setBlock,
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
          setBlock={setBlock}
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
  const [block, setBlock] = useState([]);
  const prevClickIndex = usePrevious(clickIndex);
  const [isGameOver, setIsGameOver] = useState(false);

  const clickedBlock = useMemo(
    () => (block.length === 0 ? null : block.find(({ blockIndex }) => blockIndex === clickIndex)),
    [block, clickIndex],
  );

  function restartGame() {
    setClickIndex(null);
    setIsFirstClicked(false);
    setBlock([]);
    setIsGameOver(false);
  }

  useEffect(() => {
    if (!isFirstClicked || !Number.isInteger(clickIndex)) return;
    if (block.length === 0) {
      console.log('first click ---> create mine');
      const initialBlock = getInitialBlock(BOARD_SIZE, clickIndex);
      const autoOpenCeilIndexes = getAutoOpenCeilIndex(initialBlock, clickIndex);
      autoOpenCeilIndexes.forEach((ceilIndex) => {
        const ceil = initialBlock[ceilIndex];
        initialBlock[ceilIndex] = { ...ceil, blockState: 'open' };
      });
      setBlock(initialBlock);
    } else if (prevClickIndex !== clickIndex) {
      const cloneBlock = [...block];
      const autoOpenCeilIndexes = getAutoOpenCeilIndex(cloneBlock, clickIndex);
      autoOpenCeilIndexes.forEach((ceilIndex) => {
        const ceil = cloneBlock[ceilIndex];
        cloneBlock[ceilIndex] = { ...ceil, blockState: 'open' };
      });
      setBlock(cloneBlock);
    }
  }, [block, clickIndex, clickedBlock, isFirstClicked, prevClickIndex]);

  useEffect(() => {
    if (clickedBlock?.aroundMines === -1) {
      setIsGameOver(true);
    }
  }, [clickedBlock]);

  return (
    <>
      <div style={{ margin: 50 }}>
        {[...Array(row).keys()].map((rowCount) =>
          createOneRow(
            rowCount,
            column,
            block,
            setBlock,
            isFirstClicked,
            setIsFirstClicked,
            setClickIndex,
            isGameOver,
          ),
        )}
      </div>
      <button style={{ margin: 50 }} onClick={restartGame}>
        Restart Game
      </button>
    </>
  );
}

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

function getUniqueRandom(count, max, excludeValue) {
  const uniqueNumber = new Set();
  while (uniqueNumber.size !== count) {
    const number = Math.floor(Math.random() * max);
    if (number !== excludeValue) {
      uniqueNumber.add(number);
    }
  }
  return [...uniqueNumber];
}

function getInitialBlock(size, clickedIndex) {
  const mineIndexes = getUniqueRandom(MINE_COUNT, size * size, clickedIndex);
  console.log({ mineIndexes });
  const blocks = [...Array(size * size).keys()].map((index) => {
    const isMine = mineIndexes.includes(index);
    return {
      blockIndex: index,
      aroundMines: isMine ? -1 : intersection(mineIndexes, getAdjacentIndex(index, size)).length,
      blockState: clickedIndex === index ? 'open' : 'closed', // "closed", "open", "flag" }; // TODO
    };
  });

  return blocks;
}

function intersection(arrayA, arrayB) {
  return arrayA.filter((value) => arrayB.includes(value));
}

function Minesweeper() {
  return <Board row={BOARD_SIZE} column={BOARD_SIZE} />;
}

export default Minesweeper;

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}
