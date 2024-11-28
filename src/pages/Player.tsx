import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerRegistration } from "@/components/PlayerRegistration";
import { PlayerCard } from "@/components/PlayerCard";

const Player = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/game-selection');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <PlayerRegistration />
      </div>
    </div>
  );
};

export default Player;