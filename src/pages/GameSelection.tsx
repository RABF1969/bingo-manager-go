import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const GameSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/player');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">Seleção de Jogo</h2>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Em breve você poderá selecionar um jogo para participar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameSelection;