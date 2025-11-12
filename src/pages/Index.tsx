import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Heart, TrendingUp, Activity } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Dumbbell className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              BioFit
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Seu parceiro completo na jornada de saúde e bem-estar
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acompanhe sua dieta, evolução corporal, medicamentos e bem-estar em um só lugar
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Controle Completo</h3>
              <p className="text-sm text-muted-foreground">
                Monitore peso, medidas, IMC e evolução fotográfica
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Diário Completo</h3>
              <p className="text-sm text-muted-foreground">
                Registre alimentação, exercícios e medicamentos
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Bem-estar</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu humor e disposição diária
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Começar Agora
            </Button>
            <p className="text-sm text-muted-foreground">
              Transforme sua saúde hoje mesmo 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
