
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, loading } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg animate-fade-up">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-navy mb-4">
            <CalendarDays size={32} className="text-gold" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-navy">Sistema de Agendamento de Provas</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite seu email" 
                        type="email"
                        disabled={loading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite sua senha" 
                        type="password"
                        disabled={loading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-navy hover:bg-navy/90" 
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
