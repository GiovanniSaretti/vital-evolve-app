import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, Plus, Heart } from "lucide-react";

const moodEmojis = ["😢", "😕", "😐", "🙂", "😄"];

export default function MoodLog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    mood_score: 3,
    energy_level: 3,
    motivation_level: 3,
    notes: "",
    log_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMoodLogs();
  }, []);

  const fetchMoodLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .order("log_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar registros");
    } else {
      setMoodLogs(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_score: formData.mood_score,
        energy_level: formData.energy_level,
        motivation_level: formData.motivation_level,
        notes: formData.notes,
        log_date: formData.log_date,
      });

      if (error) throw error;

      toast.success("Registro salvo com sucesso! 💚");
      setFormData({
        mood_score: 3,
        energy_level: 3,
        motivation_level: 3,
        notes: "",
        log_date: new Date().toISOString().split('T')[0],
      });
      fetchMoodLogs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-primary">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bem-estar</h1>
            <p className="text-sm text-muted-foreground">Como você está se sentindo?</p>
          </div>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Como está seu humor hoje?</Label>
                  <div className="flex items-center justify-between mt-3 mb-2">
                    {moodEmojis.map((emoji, index) => (
                      <span
                        key={index}
                        className={`text-3xl transition-transform ${
                          formData.mood_score === index + 1 ? "scale-125" : "opacity-40"
                        }`}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                  <Slider
                    value={[formData.mood_score]}
                    onValueChange={([value]) => setFormData({ ...formData, mood_score: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Nível de Energia</Label>
                  <div className="flex items-center justify-between mt-3 mb-2">
                    <span className="text-sm text-muted-foreground">Baixa</span>
                    <span className="font-semibold text-primary">{formData.energy_level}</span>
                    <span className="text-sm text-muted-foreground">Alta</span>
                  </div>
                  <Slider
                    value={[formData.energy_level]}
                    onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <div>
                  <Label>Nível de Motivação</Label>
                  <div className="flex items-center justify-between mt-3 mb-2">
                    <span className="text-sm text-muted-foreground">Baixa</span>
                    <span className="font-semibold text-primary">{formData.motivation_level}</span>
                    <span className="text-sm text-muted-foreground">Alta</span>
                  </div>
                  <Slider
                    value={[formData.motivation_level]}
                    onValueChange={([value]) => setFormData({ ...formData, motivation_level: value })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Como foi seu dia? (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Conte um pouco sobre como você se sentiu hoje..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Registro"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          {moodLogs.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum registro ainda
              </CardContent>
            </Card>
          ) : (
            moodLogs.map((log) => (
              <Card key={log.id} className="card-elegant">
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <h3 className="font-semibold">
                      {new Date(log.log_date).toLocaleDateString('pt-BR')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-center">
                      <span className="text-3xl">{moodEmojis[log.mood_score - 1]}</span>
                      <p className="text-xs text-muted-foreground mt-1">Humor</p>
                    </div>
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energia:</span>
                        <span className="font-medium">{log.energy_level}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Motivação:</span>
                        <span className="font-medium">{log.motivation_level}/5</span>
                      </div>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground italic border-t pt-3">
                      {log.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}