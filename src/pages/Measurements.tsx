import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Plus, Camera, Ruler } from "lucide-react";

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
      .order("measurement_date", { ascending: false });

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
            <Ruler className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medidas & Evolução</h1>
            <p className="text-sm text-muted-foreground">Acompanhe seu progresso</p>
          </div>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novas Medidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="measurement_date">Data</Label>
                <Input
                  id="measurement_date"
                  type="date"
                  value={formData.measurement_date}
                  onChange={(e) => setFormData({ ...formData, measurement_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
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
                  <Label htmlFor="waist">Cintura (cm)</Label>
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
                  <Label htmlFor="hip">Quadril (cm)</Label>
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
                  <Label htmlFor="abdomen">Abdômen (cm)</Label>
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
                  <Label htmlFor="arm">Braço (cm)</Label>
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
                  <Label htmlFor="thigh">Coxa (cm)</Label>
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
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </Button>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
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
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Registrar Medidas"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          {measurements.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma medida registrada ainda
              </CardContent>
            </Card>
          ) : (
            measurements.map((measurement) => (
              <Card key={measurement.id} className="card-elegant">
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <h3 className="font-semibold">
                      {new Date(measurement.measurement_date).toLocaleDateString('pt-BR')}
                    </h3>
                  </div>
                  {measurement.photo_url && (
                    <img
                      src={measurement.photo_url}
                      alt="Progresso"
                      className="w-full h-64 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {measurement.weight && (
                      <p><span className="font-medium">Peso:</span> {measurement.weight} kg</p>
                    )}
                    {measurement.waist && (
                      <p><span className="font-medium">Cintura:</span> {measurement.waist} cm</p>
                    )}
                    {measurement.hip && (
                      <p><span className="font-medium">Quadril:</span> {measurement.hip} cm</p>
                    )}
                    {measurement.abdomen && (
                      <p><span className="font-medium">Abdômen:</span> {measurement.abdomen} cm</p>
                    )}
                    {measurement.arm && (
                      <p><span className="font-medium">Braço:</span> {measurement.arm} cm</p>
                    )}
                    {measurement.thigh && (
                      <p><span className="font-medium">Coxa:</span> {measurement.thigh} cm</p>
                    )}
                  </div>
                  {measurement.notes && (
                    <p className="text-sm text-muted-foreground italic mt-2">{measurement.notes}</p>
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