import { useEffect, useState, useMemo } from 'react';
import { getAdjacentIndex, usePrevious, intersection, getUniqueRandom } from './utils';

/** Game Setting */
const BOARD_SIZE = 8;
const MINE_COUNT = 10;

function getAutoOpenCeilIndex(block, clickIndex) {
  const blockWithWalked = block.map((blockItem) => ({ ...blockItem, walked: false }));
  return openCeil(clickIndex);

  function openCeil(index) {
    const ceil = blockWithWalked[index];
    if (ceil.walked || ceil.aroundMines < 0 || ceil.blockState === 'flag') return [];
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

function Ceil({ value, isFirstClicked, block, setIsFirstClicked, clickCeil, setClickCeil, gameStatus }) {
  const blockState = block?.[value]?.blockState ?? '';
  const aroundMines = block?.[value]?.aroundMines ?? '';
  const isOpenedCeil = blockState === 'open' && aroundMines >= 0;
  const isMine = blockState === 'open' && aroundMines === -1;
  const isFlag = blockState === 'flag';

  function handleOnMouseDown(event) {
    event.preventDefault();
    if (gameStatus === 'win' || gameStatus === 'boom') return;
    if (!isFirstClicked) setIsFirstClicked(true);

    /** clickState: 1(left click), 2(right click) */
    setClickCeil({ ceilIndex: value, clickState: event.buttons });
  }

  return (
    <div
      key={value}
      style={{
        width: 40,
        height: 40,
        textAlign: 'center',
        border: '#818f9c 2px solid',
        backgroundColor: '#b1cbe3',
      }}
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={handleOnMouseDown}
    >
      {isOpenedCeil && <OpenedCeil aroundMines={aroundMines} />}
      {isMine && <MineCeil isMineInCurrentCeil={clickCeil.ceilIndex === value} />}
      {isFlag && <FlagCeil />}
      {/* {aroundMines} */}
    </div>
  );
}

function FlagCeil() {
  return <div style={{ fontWeight: 700 }}>{'🚩'}</div>;
}

function OpenedCeil({ aroundMines }) {
  return <div style={{ fontWeight: 700 }}>{aroundMines}</div>;
}

function MineCeil({ isMineInCurrentCeil }) {
  return (
    <div style={{ width: 40, height: 40, backgroundColor: isMineInCurrentCeil ? '#ff0000' : '#b1cbe3' }}>
      {'💣'}
    </div>
  );
}

function createOneRow(
  rowCount,
  elementInOneRow,
  block,
  isFirstClicked,
  setIsFirstClicked,
  setClickCeil,
  clickCeil,
  gameStatus,
) {
  return (
    <div style={{ display: 'flex' }}>
      {[...Array(elementInOneRow).keys()].map((count) => (
        <Ceil
          value={count + rowCount * elementInOneRow}
          isFirstClicked={isFirstClicked}
          block={block}
          setIsFirstClicked={setIsFirstClicked}
          clickCeil={clickCeil}
          setClickCeil={setClickCeil}
          gameStatus={gameStatus}
        />
      ))}
    </div>
  );
}

function getNewBlockWithState(block, clickCeil) {
  if (clickCeil.clickState === 2) {
    block[clickCeil.ceilIndex].blockState = 'flag';
  } else {
    const autoOpenCeilIndexes = getAutoOpenCeilIndex(block, clickCeil.ceilIndex);
    autoOpenCeilIndexes.forEach((ceilIndex) => {
      const ceil = block[ceilIndex];
      block[ceilIndex] = { ...ceil, blockState: 'open' };
    });
  }
  return block;
}

function Board({ row, column }) {
  const [isFirstClicked, setIsFirstClicked] = useState(false);
  const [clickCeil, setClickCeil] = useState({ ceilIndex: null, clickState: null });
  const [block, setBlock] = useState([]);
  const prevClickCeilIndex = usePrevious(clickCeil.ceilIndex);
  const [gameStatus, setGameStatus] = useState('progress'); // progress, boom, win

  function restartGame() {
    setClickCeil({ ceilIndex: null, clickState: null });
    setIsFirstClicked(false);
    setBlock([]);
    setGameStatus('progress');
  }

  const allMineIndexes = useMemo(
    () => block.filter((blockElement) => blockElement.aroundMines === -1).map(({ blockIndex }) => blockIndex),
    [block],
  );

  useEffect(() => {
    if (!isFirstClicked || !Number.isInteger(clickCeil.ceilIndex)) return;
    if (block.length === 0) {
      /** First click */
      // console.log('first click ---> create mine');
      const initialBlock = getInitialBlock(BOARD_SIZE, clickCeil.ceilIndex);
      const newBlock = getNewBlockWithState(initialBlock, clickCeil);
      setBlock(newBlock);
    } else if (prevClickCeilIndex !== clickCeil.ceilIndex) {
      const cloneBlock = [...block];
      const newBlock = getNewBlockWithState(cloneBlock, clickCeil);

      const remainBlock = newBlock.filter((blockElement) => blockElement.blockState === 'closed');
      const remainBlockIndex = remainBlock.map(({ blockIndex }) => blockIndex);
      const diff = remainBlockIndex.filter((mineIndex) => !allMineIndexes.includes(mineIndex));
      // console.log({ remainBlockIndex, allMineIndexes, diff });

      if (diff.length === 0) setGameStatus('win');
      setBlock(newBlock);
    }
  }, [allMineIndexes, block, clickCeil, isFirstClicked, prevClickCeilIndex]);

  const clickedBlock = useMemo(
    () => (block.length === 0 ? null : block.find(({ blockIndex }) => blockIndex === clickCeil.ceilIndex)),
    [block, clickCeil.ceilIndex],
  );

  useEffect(() => {
    if (gameStatus === 'boom') return;
    if (clickedBlock?.blockState === 'flag') return;
    if (clickedBlock?.aroundMines === -1) {
      setGameStatus('boom');

      /** Set all mines blockState to open */
      const allMinesWithOpen = block.map((blockElement) => {
        if (blockElement.aroundMines === -1) blockElement.blockState = 'open';
        return blockElement;
      });
      setBlock(allMinesWithOpen);
    }
  }, [block, clickedBlock, gameStatus]);

  return (
    <>
      <div style={{ margin: 50 }}>
        {[...Array(row).keys()].map((rowCount) =>
          createOneRow(
            rowCount,
            column,
            block,
            isFirstClicked,
            setIsFirstClicked,
            setClickCeil,
            clickCeil,
            gameStatus,
          ),
        )}
      </div>
      <button style={{ margin: 50 }} onClick={restartGame}>
        Restart Game
      </button>
      {gameStatus === 'win' && <div style={{ margin: 50 }}>🎉win🎉</div>}
    </>
  );
}

/** After first clicked, we could add mines. */
function getInitialBlock(size, clickedIndex) {
  const mineIndexes = getUniqueRandom(MINE_COUNT, size * size, clickedIndex);
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

function Minesweeper() {
  return <Board row={BOARD_SIZE} column={BOARD_SIZE} />;
}

export default Minesweeper;
