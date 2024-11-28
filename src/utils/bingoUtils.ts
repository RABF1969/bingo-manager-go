export const checkWinningPattern = (card: { number: number; marked: boolean; }[][], drawnNumbers: Set<number>) => {
  // Verifica se todos os números marcados foram realmente sorteados
  const isValidMark = (cell: { number: number; marked: boolean }) => 
    cell.number === 0 || (cell.marked && drawnNumbers.has(cell.number));

  // Verifica linhas
  const hasWinningRow = card.some(row => row.every(isValidMark));
  
  // Verifica colunas
  const hasWinningColumn = Array(5).fill(0).some((_, col) => 
    card.every(row => isValidMark(row[col]))
  );
  
  // Verifica diagonais
  const hasWinningDiagonal = 
    card.every((row, i) => isValidMark(row[i])) || // diagonal principal
    card.every((row, i) => isValidMark(row[4 - i])); // diagonal secundária

  return hasWinningRow || hasWinningColumn || hasWinningDiagonal;
};