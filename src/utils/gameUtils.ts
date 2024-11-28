export const isFullCardComplete = (numbers: number[][], markedNumbers: Set<number>, drawnNumbers: Set<number>): boolean => {
  // Check if all numbers in the card (except center) are marked and drawn
  return numbers.every(row =>
    row.every(num => num === 0 || (drawnNumbers.has(num) && markedNumbers.has(num)))
  );
};

export const findNearWinners = (
  cards: Array<{
    numbers: number[][];
    marked_numbers: number[];
    player: { name: string };
  }>,
  drawnNumbers: Set<number>
): Array<{ playerName: string; missingNumbers: number[] }> => {
  return cards.reduce<Array<{ playerName: string; missingNumbers: number[] }>>((acc, card) => {
    const markedNumbers = new Set(card.marked_numbers);
    const missingNumbers: number[] = [];

    // Check all numbers in the card
    card.numbers.forEach(row => {
      row.forEach(num => {
        if (num !== 0 && drawnNumbers.has(num) && !markedNumbers.has(num)) {
          missingNumbers.push(num);
        }
      });
    });

    // If missing 3 or fewer numbers that have been drawn
    if (missingNumbers.length <= 3 && missingNumbers.length > 0) {
      acc.push({
        playerName: card.player.name,
        missingNumbers: missingNumbers.sort((a, b) => a - b)
      });
    }

    return acc;
  }, []);
};