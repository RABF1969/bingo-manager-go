export const isCardComplete = (cardNumbers: number[][], drawnNumbers: Set<number>): boolean => {
  // Check if all numbers in the card (except center FREE space) are drawn
  return cardNumbers.every(row =>
    row.every(num => num === 0 || drawnNumbers.has(num))
  );
};