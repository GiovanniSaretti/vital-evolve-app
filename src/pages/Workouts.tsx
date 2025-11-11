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
import { ArrowLeft, Plus, Dumbbell } from "lucide-react";

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
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atividades Físicas</h1>
            <p className="text-sm text-muted-foreground">Registre seus treinos</p>
          </div>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workout_type">Tipo de Exercício</Label>
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
                <Label htmlFor="workout_date">Data</Label>
                <Input
                  id="workout_date"
                  type="date"
                  value={formData.workout_date}
                  onChange={(e) => setFormData({ ...formData, workout_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duração (minutos)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    placeholder="Ex: 45"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensidade</Label>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fasting_cardio"
                  checked={formData.fasting_cardio}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, fasting_cardio: checked as boolean })
                  }
                />
                <Label htmlFor="fasting_cardio" className="cursor-pointer">
                  Aeróbico em jejum
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Como foi o treino? Como você se sentiu?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Registrar Treino"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          {workouts.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum treino registrado ainda
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id} className="card-elegant">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{workout.workout_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.workout_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-medium">{workout.duration_minutes} min</span>
                      <span className="text-xs text-muted-foreground">{workout.intensity}</span>
                    </div>
                  </div>
                  {workout.fasting_cardio && (
                    <span className="inline-block px-2 py-1 bg-accent text-accent-foreground rounded text-xs mb-2">
                      Em jejum
                    </span>
                  )}
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground italic">{workout.notes}</p>
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