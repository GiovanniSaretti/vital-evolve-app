import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { ArrowLeft, Plus, Heart, Trash2, Loader2, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mood_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Registro excluído com sucesso");
      fetchMoodLogs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Prepare chart data
  const chartData = moodLogs
    .slice(0, 30)
    .reverse()
    .map(log => ({
      date: new Date(log.log_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      humor: log.mood_score,
      energia: log.energy_level,
      motivação: log.motivation_level,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-6xl mx-auto p-4 space-y-6 pb-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 hover-scale"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bem-estar</h1>
            <p className="text-sm text-muted-foreground">Como você está se sentindo hoje?</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="shadow-md animate-fade-in bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                Evolução do Bem-estar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="humor" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    name="Humor"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energia" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                    name="Energia"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="motivação" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--warning))', r: 4 }}
                    name="Motivação"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md animate-fade-in bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plus className="w-5 h-5 text-primary" />
              Novo Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gradient-card p-4 rounded-lg">
                  <Label className="text-base">Como está seu humor hoje?</Label>
                  <div className="flex items-center justify-between mt-4 mb-2">
                    {moodEmojis.map((emoji, index) => (
                      <span
                        key={index}
                        className={`text-4xl transition-all duration-300 ${
                          formData.mood_score === index + 1 ? "scale-125" : "opacity-30 scale-90"
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

                <div className="bg-gradient-card p-4 rounded-lg">
                  <Label className="text-base">Nível de Energia</Label>
                  <div className="flex items-center justify-between mt-4 mb-2">
                    <span className="text-sm text-muted-foreground">🔋 Baixa</span>
                    <span className="font-bold text-primary text-2xl">{formData.energy_level}</span>
                    <span className="text-sm text-muted-foreground">⚡ Alta</span>
                  </div>
                  <Slider
                    value={[formData.energy_level]}
                    onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <div className="bg-gradient-card p-4 rounded-lg">
                  <Label className="text-base">Nível de Motivação</Label>
                  <div className="flex items-center justify-between mt-4 mb-2">
                    <span className="text-sm text-muted-foreground">😔 Baixa</span>
                    <span className="font-bold text-primary text-2xl">{formData.motivation_level}</span>
                    <span className="text-sm text-muted-foreground">🚀 Alta</span>
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

              <Button type="submit" className="w-full hover-scale" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Registro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Heart className="w-5 h-5 text-primary" />
            Histórico de Bem-estar
          </h2>
          {moodLogs.length === 0 ? (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum registro ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {moodLogs.map((log) => (
                <Card key={log.id} className="shadow-sm hover:shadow-md transition-all hover-scale bg-gradient-card border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {new Date(log.log_date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O registro será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(log.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex items-start gap-4 mb-3">
                      <div className="text-center flex-shrink-0">
                        <span className="text-4xl">{moodEmojis[log.mood_score - 1]}</span>
                        <p className="text-xs text-muted-foreground mt-1">Humor</p>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gradient-card p-3 rounded-lg">
                          <p className="text-muted-foreground mb-1">⚡ Energia</p>
                          <p className="font-bold text-lg text-primary">{log.energy_level}/5</p>
                        </div>
                        <div className="bg-gradient-card p-3 rounded-lg">
                          <p className="text-muted-foreground mb-1">🚀 Motivação</p>
                          <p className="font-bold text-lg text-primary">{log.motivation_level}/5</p>
                        </div>
                      </div>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground italic border-t pt-3">
                        💭 {log.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}