import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Camera, Activity, Trash2, Loader2, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export default function Measurements() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    hip: "",
    abdomen: "",
    arm: "",
    thigh: "",
    notes: "",
    measurement_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .order("measurement_date", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar medidas");
    } else {
      setMeasurements(data || []);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (userId: string) => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, photoFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const photoUrl = await uploadPhoto(user.id);

      const { error } = await supabase.from("measurements").insert({
        user_id: user.id,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        hip: formData.hip ? parseFloat(formData.hip) : null,
        abdomen: formData.abdomen ? parseFloat(formData.abdomen) : null,
        arm: formData.arm ? parseFloat(formData.arm) : null,
        thigh: formData.thigh ? parseFloat(formData.thigh) : null,
        notes: formData.notes,
        measurement_date: formData.measurement_date,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success("Medidas registradas com sucesso! 📏");
      setFormData({
        weight: "",
        waist: "",
        hip: "",
        abdomen: "",
        arm: "",
        thigh: "",
        notes: "",
        measurement_date: new Date().toISOString().split('T')[0],
      });
      setPhotoFile(null);
      setPhotoPreview("");
      fetchMeasurements();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("measurements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Medida excluída com sucesso");
      fetchMeasurements();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const chartData = measurements.map(m => ({
    date: new Date(m.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: m.weight || null,
    cintura: m.waist || null,
    quadril: m.hip || null,
    abdomen: m.abdomen || null,
  })).filter(d => d.peso || d.cintura || d.quadril || d.abdomen);

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
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medidas & Evolução</h1>
            <p className="text-sm text-muted-foreground">Acompanhe seu progresso e evolução física</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <Card className="card-elegant animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Evolução das Medidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                  <Line type="monotone" dataKey="cintura" stroke="hsl(var(--accent))" strokeWidth={2} name="Cintura (cm)" />
                  <Line type="monotone" dataKey="quadril" stroke="hsl(var(--warning))" strokeWidth={2} name="Quadril (cm)" />
                  <Line type="monotone" dataKey="abdomen" stroke="hsl(var(--destructive))" strokeWidth={2} name="Abdômen (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="card-elegant animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Novas Medidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="measurement_date">Data *</Label>
                <Input
                  id="measurement_date"
                  type="date"
                  value={formData.measurement_date}
                  onChange={(e) => setFormData({ ...formData, measurement_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">⚖️ Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 75.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waist">📏 Cintura (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 85"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hip">📏 Quadril (cm)</Label>
                  <Input
                    id="hip"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 95"
                    value={formData.hip}
                    onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abdomen">📏 Abdômen (cm)</Label>
                  <Input
                    id="abdomen"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 90"
                    value={formData.abdomen}
                    onChange={(e) => setFormData({ ...formData, abdomen: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arm">💪 Braço (cm)</Label>
                  <Input
                    id="arm"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 30"
                    value={formData.arm}
                    onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thigh">🦵 Coxa (cm)</Label>
                  <Input
                    id="thigh"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 55"
                    value={formData.thigh}
                    onChange={(e) => setFormData({ ...formData, thigh: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Foto de Progresso (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo')?.click()}
                    className="hover-scale"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </Button>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg shadow-md animate-scale-in"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Como você está se sentindo com seu progresso?"
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
                  "Registrar Medidas"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Medidas</h2>
          {measurements.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma medida registrada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {measurements.slice().reverse().map((measurement) => (
                <Card key={measurement.id} className="card-elegant hover-scale">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">
                        {new Date(measurement.measurement_date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
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
                            <AlertDialogTitle>Excluir medida?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A medida será permanentemente removida.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(measurement.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {measurement.photo_url && (
                      <img
                        src={measurement.photo_url}
                        alt="Progresso"
                        className="w-full h-64 object-cover rounded-lg mb-3 shadow-md"
                      />
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {measurement.weight && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">⚖️ Peso:</span>
                          <span className="font-bold ml-1">{measurement.weight} kg</span>
                        </div>
                      )}
                      {measurement.waist && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">📏 Cintura:</span>
                          <span className="font-bold ml-1">{measurement.waist} cm</span>
                        </div>
                      )}
                      {measurement.hip && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">📏 Quadril:</span>
                          <span className="font-bold ml-1">{measurement.hip} cm</span>
                        </div>
                      )}
                      {measurement.abdomen && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">📏 Abdômen:</span>
                          <span className="font-bold ml-1">{measurement.abdomen} cm</span>
                        </div>
                      )}
                      {measurement.arm && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">💪 Braço:</span>
                          <span className="font-bold ml-1">{measurement.arm} cm</span>
                        </div>
                      )}
                      {measurement.thigh && (
                        <div className="bg-gradient-card p-2 rounded">
                          <span className="text-muted-foreground">🦵 Coxa:</span>
                          <span className="font-bold ml-1">{measurement.thigh} cm</span>
                        </div>
                      )}
                    </div>
                    {measurement.notes && (
                      <p className="text-sm text-muted-foreground italic border-t pt-3 mt-3">
                        💭 {measurement.notes}
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