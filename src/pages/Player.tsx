import { PlayerRegistration } from "@/components/PlayerRegistration";
import { PlayerCard } from "@/components/PlayerCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Player = () => {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {!isRegistered ? (
          <PlayerRegistration />
        ) : (
          <PlayerCard />
        )}
      </div>
    </div>
  );
};

export default Player;