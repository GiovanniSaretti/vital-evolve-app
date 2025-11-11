import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Dumbbell } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    height: "",
    current_weight: "",
    initial_weight: "",
    goal_weight: "",
    treatment_start_date: "",
    activity_level: "",
    dietary_restrictions: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          birth_date: data.birth_date || "",
          height: data.height?.toString() || "",
          current_weight: data.current_weight?.toString() || "",
          initial_weight: data.initial_weight?.toString() || "",
          goal_weight: data.goal_weight?.toString() || "",
          treatment_start_date: data.treatment_start_date || "",
          activity_level: data.activity_level?.toString() || "",
          dietary_restrictions: data.dietary_restrictions || "",
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          birth_date: formData.birth_date || null,
          height: formData.height ? parseFloat(formData.height) : null,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
          initial_weight: formData.initial_weight ? parseFloat(formData.initial_weight) : null,
          goal_weight: formData.goal_weight ? parseFloat(formData.goal_weight) : null,
          treatment_start_date: formData.treatment_start_date || null,
          activity_level: formData.activity_level ? parseInt(formData.activity_level) : null,
          dietary_restrictions: formData.dietary_restrictions || null,
        })
        .eq("id", user!.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const calculateIMC = () => {
    const weight = parseFloat(formData.current_weight);
    const height = parseFloat(formData.height);

    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { text: "Abaixo do peso", color: "text-warning" };
    if (imc < 25) return { text: "Peso ideal", color: "text-success" };
    if (imc < 30) return { text: "Sobrepeso", color: "text-warning" };
    return { text: "Obesidade", color: "text-destructive" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const imc = calculateIMC();
  const imcStatus = imc ? getIMCStatus(parseFloat(imc)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Meu Perfil</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* IMC Card */}
          {imc && (
            <Card className="p-6 bg-gradient-card">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Seu IMC</p>
                <p className="text-4xl font-bold text-primary">{imc}</p>
                <p className={`text-sm font-medium mt-2 ${imcStatus?.color}`}>
                  {imcStatus?.text}
                </p>
              </div>
            </Card>
          )}

          {/* Personal Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  placeholder="170.5"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Weight Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Controle de Peso</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_weight">Peso Atual (kg)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  step="0.1"
                  placeholder="75.5"
                  value={formData.current_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, current_weight: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="initial_weight">Peso Inicial (kg)</Label>
                <Input
                  id="initial_weight"
                  type="number"
                  step="0.1"
                  placeholder="80.0"
                  value={formData.initial_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, initial_weight: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="goal_weight">Meta de Peso (kg)</Label>
                <Input
                  id="goal_weight"
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  value={formData.goal_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_weight: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="treatment_start_date">
                  Data de Início do Tratamento
                </Label>
                <Input
                  id="treatment_start_date"
                  type="date"
                  value={formData.treatment_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      treatment_start_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Lifestyle */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Estilo de Vida</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="activity_level">
                  Nível de Atividade Física (1-10)
                </Label>
                <Input
                  id="activity_level"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="5"
                  value={formData.activity_level}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_level: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1 = Sedentário, 10 = Muito ativo
                </p>
              </div>

              <div>
                <Label htmlFor="dietary_restrictions">Restrições Alimentares</Label>
                <Textarea
                  id="dietary_restrictions"
                  placeholder="Ex: intolerância à lactose, vegetariano, etc."
                  value={formData.dietary_restrictions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dietary_restrictions: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
