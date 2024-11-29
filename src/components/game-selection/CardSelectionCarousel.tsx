import { PlayerCard } from "@/components/PlayerCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="relative px-4 sm:px-8 md:px-12">
      <Carousel className="w-full max-w-xs sm:max-w-md md:max-w-3xl mx-auto">
        <CarouselContent>
          {availableCards.map((card) => (
            <CarouselItem key={card.id} className="pl-1 md:pl-2">
              <div 
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 p-2 md:p-4 rounded-xl ${
                  selectedCard === card.id ? 'ring-4 ring-violet-500/50' : ''
                }`}
                onClick={() => onCardSelect(card.id)}
              >
                <PlayerCard numbers={card.numbers} preview isMobile={isMobile} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};