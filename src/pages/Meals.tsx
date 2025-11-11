import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Camera, Utensils } from "lucide-react";

export default function Meals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    meal_type: "",
    food_items: "",
    calories: "",
    notes: "",
    meal_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .order("meal_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar refeições");
    } else {
      setMeals(data || []);
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
      .from('meal-photos')
      .upload(fileName, photoFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('meal-photos')
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

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: formData.meal_type,
        food_items: formData.food_items,
        calories: formData.calories ? parseInt(formData.calories) : null,
        notes: formData.notes,
        meal_date: new Date(formData.meal_date).toISOString(),
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success("Refeição registrada com sucesso! 🍽️");
      setFormData({
        meal_type: "",
        food_items: "",
        calories: "",
        notes: "",
        meal_date: new Date().toISOString().split('T')[0],
      });
      setPhotoFile(null);
      setPhotoPreview("");
      fetchMeals();
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
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diário Alimentar</h1>
            <p className="text-sm text-muted-foreground">Registre suas refeições</p>
          </div>
        </div>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Refeição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal_type">Tipo de Refeição</Label>
                <Select
                  value={formData.meal_type}
                  onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Café da Manhã">☕ Café da Manhã</SelectItem>
                    <SelectItem value="Almoço">🍽️ Almoço</SelectItem>
                    <SelectItem value="Jantar">🌙 Jantar</SelectItem>
                    <SelectItem value="Lanche">🍎 Lanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_date">Data</Label>
                <Input
                  id="meal_date"
                  type="date"
                  value={formData.meal_date}
                  onChange={(e) => setFormData({ ...formData, meal_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="food_items">Alimentos</Label>
                <Textarea
                  id="food_items"
                  placeholder="Ex: Arroz integral, frango grelhado, salada..."
                  value={formData.food_items}
                  onChange={(e) => setFormData({ ...formData, food_items: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Calorias (opcional)</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Ex: 450"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Foto da Refeição (opcional)</Label>
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
                  placeholder="Como você se sentiu após a refeição?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Registrar Refeição"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          {meals.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma refeição registrada ainda
              </CardContent>
            </Card>
          ) : (
            meals.map((meal) => (
              <Card key={meal.id} className="card-elegant">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{meal.meal_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meal.meal_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {meal.calories && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                  {meal.photo_url && (
                    <img
                      src={meal.photo_url}
                      alt="Refeição"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm mb-2">{meal.food_items}</p>
                  {meal.notes && (
                    <p className="text-sm text-muted-foreground italic">{meal.notes}</p>
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