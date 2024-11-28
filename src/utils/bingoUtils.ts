export const checkWinningPattern = (card: { number: number; marked: boolean; }[][], drawnNumbers: Set<number>) => {
  // Verifica se todos os números marcados foram realmente sorteados
  const isValidMark = (cell: { number: number; marked: boolean }) => 
    cell.number === 0 || (cell.marked && drawnNumbers.has(cell.number));

  // Verifica se toda a cartela está preenchida (exceto o centro que é livre)
  return card.every(row => 
    row.every(cell => isValidMark(cell))
  );
};