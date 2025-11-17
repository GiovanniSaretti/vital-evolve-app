import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Plus, Dumbbell, Trash2, Loader2, TrendingUp } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Workouts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    workout_type: "",
    duration_minutes: "",
    intensity: "",
    fasting_cardio: false,
    notes: "",
    workout_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("workout_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar treinos");
    } else {
      setWorkouts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("workouts").insert({
        user_id: user.id,
        workout_type: formData.workout_type,
        duration_minutes: parseInt(formData.duration_minutes),
        intensity: formData.intensity,
        fasting_cardio: formData.fasting_cardio,
        notes: formData.notes,
        workout_date: new Date(formData.workout_date).toISOString(),
      });

      if (error) throw error;

      toast.success("Treino registrado com sucesso! 💪");
      setFormData({
        workout_type: "",
        duration_minutes: "",
        intensity: "",
        fasting_cardio: false,
        notes: "",
        workout_date: new Date().toISOString().split('T')[0],
      });
      fetchWorkouts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Treino excluído com sucesso");
      fetchWorkouts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Leve": return "text-success";
      case "Média": return "text-warning";
      case "Alta": return "text-destructive";
      default: return "";
    }
  };

  const chartData = workouts
    .slice(0, 20)
    .reverse()
    .map(workout => ({
      date: new Date(workout.workout_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      duração: workout.duration_minutes,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
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
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atividades Físicas</h1>
            <p className="text-sm text-muted-foreground">Registre seus treinos e acompanhe sua evolução</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <Card className="card-elegant animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Duração dos Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="duração" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="card-elegant animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novo Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout_type">Tipo de Exercício *</Label>
                  <Select
                    value={formData.workout_type}
                    onValueChange={(value) => setFormData({ ...formData, workout_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Musculação">🏋️ Musculação</SelectItem>
                      <SelectItem value="Aeróbico">🏃 Aeróbico</SelectItem>
                      <SelectItem value="Funcional">🤸 Funcional</SelectItem>
                      <SelectItem value="Natação">🏊 Natação</SelectItem>
                      <SelectItem value="Ciclismo">🚴 Ciclismo</SelectItem>
                      <SelectItem value="Yoga">🧘 Yoga</SelectItem>
                      <SelectItem value="Caminhada">🚶 Caminhada</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workout_date">Data *</Label>
                  <Input
                    id="workout_date"
                    type="date"
                    value={formData.workout_date}
                    onChange={(e) => setFormData({ ...formData, workout_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duração (minutos) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    placeholder="Ex: 45"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensidade *</Label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value) => setFormData({ ...formData, intensity: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leve">🟢 Leve</SelectItem>
                      <SelectItem value="Média">🟡 Média</SelectItem>
                      <SelectItem value="Alta">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-lg">
                <Checkbox
                  id="fasting_cardio"
                  checked={formData.fasting_cardio}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, fasting_cardio: checked as boolean })
                  }
                />
                <Label htmlFor="fasting_cardio" className="cursor-pointer">
                  ⚡ Aeróbico em jejum
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Como foi o treino? Como você se sentiu?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full hover-scale" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Registrar Treino"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Treinos</h2>
          {workouts.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum treino registrado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="card-elegant hover-scale">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{workout.workout_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.workout_date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                              <AlertDialogTitle>Excluir treino?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O treino será permanentemente removido.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(workout.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        ⏱️ {workout.duration_minutes} min
                      </span>
                      <span className={`px-3 py-1 bg-muted rounded-full text-sm font-medium ${getIntensityColor(workout.intensity)}`}>
                        {workout.intensity}
                      </span>
                      {workout.fasting_cardio && (
                        <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
                          ⚡ Em jejum
                        </span>
                      )}
                    </div>
                    {workout.notes && (
                      <p className="text-sm text-muted-foreground italic border-t pt-3">
                        💭 {workout.notes}
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