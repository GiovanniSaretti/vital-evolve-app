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
import { ArrowLeft, Plus, Pill, Trash2, Loader2, MapPin } from "lucide-react";
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

export default function Medications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    medication_name: "",
    dose: "",
    dose_unit: "mg",
    application_site: "",
    application_date: new Date().toISOString().slice(0, 16),
    side_effects: "",
    notes: "",
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .order("application_date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar medicamentos");
    } else {
      setMedications(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("medications").insert({
        user_id: user.id,
        medication_name: formData.medication_name,
        dose: parseFloat(formData.dose),
        dose_unit: formData.dose_unit,
        application_site: formData.application_site,
        application_date: new Date(formData.application_date).toISOString(),
        side_effects: formData.side_effects,
        notes: formData.notes,
      });

      if (error) throw error;

      toast.success("Medicamento registrado com sucesso! 💊");
      setFormData({
        medication_name: "",
        dose: "",
        dose_unit: "mg",
        application_site: "",
        application_date: new Date().toISOString().slice(0, 16),
        side_effects: "",
        notes: "",
      });
      fetchMedications();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Medicamento excluído com sucesso");
      fetchMedications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-6 pb-20">
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
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medicamentos</h1>
            <p className="text-sm text-muted-foreground">Registre suas aplicações e doses</p>
          </div>
        </div>

        <Card className="card-elegant animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nova Aplicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication_name">Nome do Medicamento *</Label>
                <Input
                  id="medication_name"
                  placeholder="Ex: Tirzepatida, Ozempic, Wegovy..."
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dose">Dose *</Label>
                  <Input
                    id="dose"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.5"
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dose_unit">Unidade *</Label>
                  <Select
                    value={formData.dose_unit}
                    onValueChange={(value) => setFormData({ ...formData, dose_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="mcg">mcg</SelectItem>
                      <SelectItem value="UI">UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_date">Data e Hora da Aplicação *</Label>
                <Input
                  id="application_date"
                  type="datetime-local"
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_site">Local de Aplicação *</Label>
                <Select
                  value={formData.application_site}
                  onValueChange={(value) => setFormData({ ...formData, application_site: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abdômen">Abdômen</SelectItem>
                    <SelectItem value="Braço Direito">Braço Direito</SelectItem>
                    <SelectItem value="Braço Esquerdo">Braço Esquerdo</SelectItem>
                    <SelectItem value="Coxa Direita">Coxa Direita</SelectItem>
                    <SelectItem value="Coxa Esquerda">Coxa Esquerda</SelectItem>
                    <SelectItem value="Glúteo">Glúteo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="side_effects">Efeitos Colaterais (opcional)</Label>
                <Textarea
                  id="side_effects"
                  placeholder="Ex: náusea leve, dor no local da aplicação..."
                  value={formData.side_effects}
                  onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Outras observações..."
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
                  "Registrar Aplicação"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico de Aplicações</h2>
          {medications.length === 0 ? (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma aplicação registrada ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {medications.map((medication) => (
                <Card key={medication.id} className="card-elegant hover-scale">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{medication.medication_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(medication.application_date).toLocaleString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          💉 {medication.dose} {medication.dose_unit}
                        </span>
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
                              <AlertDialogTitle>Excluir aplicação?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A aplicação será permanentemente removida.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(medication.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Local:</span> {medication.application_site}
                      </p>
                      {medication.side_effects && (
                        <p className="text-destructive bg-destructive/10 p-2 rounded">
                          <span className="font-medium">⚠️ Efeitos:</span> {medication.side_effects}
                        </p>
                      )}
                      {medication.notes && (
                        <p className="text-muted-foreground italic border-t pt-3 mt-3">
                          💭 {medication.notes}
                        </p>
                      )}
                    </div>
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