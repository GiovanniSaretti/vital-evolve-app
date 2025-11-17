import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dumbbell, User as UserIcon, Activity, Apple, Syringe, Heart, LogOut, TrendingUp } from "lucide-react";
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);
  const loadProfile = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Até logo! Continue firme na sua jornada!");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Erro ao sair");
    }
  };
  const calculateIMC = () => {
    if (profile?.current_weight && profile?.height) {
      const heightInMeters = profile.height / 100;
      return (profile.current_weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };
  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return {
      text: "Abaixo do peso",
      color: "text-warning"
    };
    if (imc < 25) return {
      text: "Peso ideal",
      color: "text-success"
    };
    if (imc < 30) return {
      text: "Sobrepeso",
      color: "text-warning"
    };
    return {
      text: "Obesidade",
      color: "text-destructive"
    };
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  const imc = calculateIMC();
  const imcStatus = imc ? getIMCStatus(parseFloat(imc)) : null;
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BioLife
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Olá, {profile?.full_name || "Bem-vindo"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Continue firme na sua jornada de transformação
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Atual</p>
                <p className="text-2xl font-bold">
                  {profile?.current_weight ? `${profile.current_weight} kg` : "--"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IMC</p>
                {imc ? <div>
                    <p className="text-2xl font-bold">{imc}</p>
                    <p className={`text-xs ${imcStatus?.color}`}>{imcStatus?.text}</p>
                  </div> : <p className="text-2xl font-bold">--</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Apple className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calorias Hoje</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Treinos Semana</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/profile")}>
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
              <UserIcon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Meu Perfil</h3>
            <p className="text-muted-foreground text-sm">
              Atualize seus dados e acompanhe seu progresso
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/meals")}>
            <div className="w-14 h-14 bg-gradient-to-br from-warning/20 to-warning/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Apple className="w-7 h-7 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Diário Alimentar</h3>
            <p className="text-muted-foreground text-sm">
              Registre suas refeições e calorias
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/workouts")}>
            <div className="w-14 h-14 bg-gradient-to-br from-success/20 to-success/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Atividades Físicas</h3>
            <p className="text-muted-foreground text-sm">
              Registre seus treinos e exercícios
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/medications")}>
            <div className="w-14 h-14 bg-gradient-to-br from-destructive/20 to-destructive/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Syringe className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Medicamentos</h3>
            <p className="text-muted-foreground text-sm">
              Controle suas aplicações e doses
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/mood")}>
            <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bem-estar</h3>
            <p className="text-muted-foreground text-sm">
              Registre seu humor e disposição
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate("/measurements")}>
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Medidas & Evolução</h3>
            <p className="text-muted-foreground text-sm">
              Acompanhe suas medidas e fotos de progresso
            </p>
          </Card>
        </div>

        {/* Motivational Message */}
        <Card className="mt-8 p-6 bg-gradient-primary text-primary-foreground">
          <p className="text-center text-lg font-medium">
            💪 "Cada passo conta na sua jornada de transformação. Continue firme!"
          </p>
        </Card>
      </main>
    </div>;
};
export default Dashboard;