import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { AdminDashboardContent } from "@/components/admin/AdminDashboardContent";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return isAuthenticated ? <AdminDashboardContent /> : <AdminAuth />;
};

export default AdminDashboard;