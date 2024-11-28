import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface PlayerData {
  name: string;
  email: string;
  phone: string;
}

export const PlayerRegistration = () => {
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: '',
    email: '',
    phone: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui será integrado com backend posteriormente
    toast({
      title: "Registro realizado!",
      description: "Você já pode escolher sua cartela.",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Registro de Jogador</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nome completo"
              value={playerData.name}
              onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="E-mail"
              value={playerData.email}
              onChange={(e) => setPlayerData({ ...playerData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              placeholder="Telefone"
              value={playerData.phone}
              onChange={(e) => setPlayerData({ ...playerData, phone: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Registrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};