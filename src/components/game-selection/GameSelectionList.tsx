import { GameCard } from "./GameCard";

interface Game {
  id: string;
  created_at: string;
  status: string;
}

interface GameSelectionListProps {
  games: Game[];
  onGameSelect: (gameId: string) => void;
}

export const GameSelectionList = ({ games, onGameSelect }: GameSelectionListProps) => {
  return (
    <div className="grid gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          id={game.id}
          createdAt={game.created_at}
          status={game.status}
          onSelect={onGameSelect}
        />
      ))}
    </div>
  );
};