import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

interface CreateGameDialogProps {
  onCreateGame: () => Promise<void>;
}

export const CreateGameDialog = ({ onCreateGame }: CreateGameDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    await onCreateGame();
    setIsCreating(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Jogo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Jogo</DialogTitle>
          <DialogDescription>
            Você está prestes a criar um novo jogo de bingo. Deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isCreating ? "Criando..." : "Criar Jogo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};