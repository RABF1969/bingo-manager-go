import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Player {
  name: string;
  email: string;
  phone: string | null;
}

interface WinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winner: Player | null;
}

export const WinnerDialog = ({ open, onOpenChange, winner }: WinnerDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-purple-100 to-pink-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎉 BINGO! Temos um Vencedor! 🎉
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4 mt-4">
            <p className="text-xl font-semibold text-gray-800">
              {winner?.name}
            </p>
            <p className="text-gray-600">
              Email: {winner?.email}
            </p>
            {winner?.phone && (
              <p className="text-gray-600">
                Telefone: {winner?.phone}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Fechar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};