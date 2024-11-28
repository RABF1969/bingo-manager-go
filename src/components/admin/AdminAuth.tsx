import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const AdminAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/admin-dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Acesso ao Painel Administrativo</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Faça login para acessar o painel administrativo.
            </AlertDescription>
          </Alert>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#666666',
                  }
                }
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800',
                input: 'w-full px-3 py-2 border rounded',
                message: 'text-sm text-red-600 mt-1',
                anchor: 'text-black hover:text-gray-600',
              }
            }}
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Registrar',
                  loading_button_label: 'Registrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Não tem uma conta? Registre-se',
                  confirmation_text: 'Verifique seu email para o link de confirmação',
                  email_input_placeholder: 'Seu endereço de email',
                  password_input_placeholder: 'Sua senha'
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                  email_input_placeholder: 'Seu endereço de email',
                  password_input_placeholder: 'Sua senha'
                }
              }
            }}
            providers={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};