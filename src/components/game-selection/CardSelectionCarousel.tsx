import { PlayerCard } from "@/components/PlayerCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BingoCard {
  id: string;
  numbers: number[][];
}

interface CardSelectionCarouselProps {
  availableCards: BingoCard[];
  selectedCard: string | null;
  onCardSelect: (cardId: string) => void;
}

export const CardSelectionCarousel = ({ 
  availableCards, 
  selectedCard, 
  onCardSelect 
}: CardSelectionCarouselProps) => {
  return (
    <div className="relative px-12">
      <Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {availableCards.map((card) => (
            <CarouselItem key={card.id}>
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 p-4 rounded-xl ${
                  selectedCard === card.id ? 'ring-4 ring-violet-500/50' : ''
                }`}
                onClick={() => onCardSelect(card.id)}
              >
                <PlayerCard numbers={card.numbers} preview />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};