import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: playerData.email,
        password: Math.random().toString(36).slice(-8),
        options: {
          data: {
            name: playerData.name,
          }
        }
      });

      if (authError) throw authError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone: playerData.phone })
        .eq('id', authData.user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Registro realizado com sucesso!",
        description: "Você será redirecionado para escolher sua cartela.",
      });

      // Forçar o redirecionamento imediato
      navigate('/game-selection');

    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro ao tentar registrar. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="E-mail"
              value={playerData.email}
              onChange={(e) => setPlayerData({ ...playerData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              placeholder="Telefone"
              value={playerData.phone}
              onChange={(e) => setPlayerData({ ...playerData, phone: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};