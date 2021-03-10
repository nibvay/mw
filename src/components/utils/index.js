import { useEffect, useRef } from 'react';

export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function intersection(arrayA, arrayB) {
  return arrayA.filter((value) => arrayB.includes(value));
}

export function getUniqueRandom(count, max, excludeValue) {
  const uniqueNumber = new Set();
  while (uniqueNumber.size !== count) {
    const number = Math.floor(Math.random() * max);
    if (number !== excludeValue) {
      uniqueNumber.add(number);
    }
  }
  return [...uniqueNumber];
}

export function getAdjacentIndex(targetIndex, size) {
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
