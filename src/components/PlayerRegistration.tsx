import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PlayerRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/game-selection');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Acesso ao Bingo</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Para criar uma conta, sua senha deve ter no mínimo 6 caracteres.
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
              },
              forgotten_password: {
                email_label: 'Email',
                password_label: 'Senha',
                button_label: 'Recuperar senha',
                loading_button_label: 'Enviando instruções...',
                link_text: 'Esqueceu sua senha?',
                email_input_placeholder: 'Seu endereço de email',
                confirmation_text: 'Verifique seu email para redefinir sua senha'
              },
              update_password: {
                password_label: 'Nova senha',
                button_label: 'Atualizar senha',
                loading_button_label: 'Atualizando senha...',
                confirmation_text: 'Sua senha foi atualizada',
                password_input_placeholder: 'Sua nova senha'
              },
              magic_link: {
                email_input_label: 'Email',
                button_label: 'Enviar link mágico',
                loading_button_label: 'Enviando link mágico...',
                link_text: 'Enviar link mágico',
                email_input_placeholder: 'Seu endereço de email',
                confirmation_text: 'Verifique seu email para o link de acesso'
              }
            }
          }}
          providers={[]}
          theme="light"
        />
      </CardContent>
    </Card>
  );
};