import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function CreatePrescription() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    type: "plano_alimentar",
    description: "",
    objective: "",
    duration_days: "",
    rules: "",
    content: "",
    active: true,
  });

  useEffect(() => {
    checkAccess();
    fetchPatientInfo();
  }, [patientId]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: professional } = await supabase
        .from("health_professionals")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!professional) {
        toast.error("Você precisa ser um profissional de saúde");
        navigate("/professional-dashboard");
        return;
      }

      setProfessionalId(professional.id);

      // Verify access to patient
      const { data: relationship } = await supabase
        .from("professional_patients")
        .select("status")
        .eq("professional_id", professional.id)
        .eq("patient_id", patientId)
        .eq("status", "active")
        .single();

      if (!relationship) {
        toast.error("Você não tem acesso a este paciente");
        navigate("/patients");
        return;
      }
    } catch (error: any) {
      console.error("Error checking access:", error);
      toast.error("Erro ao verificar acesso");
      navigate("/patients");
    }
  };

  const fetchPatientInfo = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", patientId)
        .single();

      if (data) {
        setPatientName(data.full_name);
      }
    } catch (error: any) {
      console.error("Error fetching patient info:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prescriptionData = {
        patient_id: patientId!,
        professional_id: professionalId,
        title: formData.title,
        type: formData.type as "plano_alimentar" | "plano_treino" | "plano_comportamental" | "plano_geral" | "fisioterapia" | "reabilitacao_cardiaca",
        description: formData.description || null,
        objective: formData.objective || null,
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        rules: formData.rules || null,
        content: formData.content ? JSON.parse(formData.content) : null,
        active: formData.active,
      };

      const { error } = await supabase
        .from("prescriptions")
        .insert([prescriptionData]);

      if (error) throw error;

      toast.success("Prescrição criada com sucesso!");
      navigate(`/patient/${patientId}`);
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      toast.error("Erro ao criar prescrição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patient/${patientId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nova Prescrição</h1>
            <p className="text-muted-foreground">Paciente: {patientName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Prescrição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano_alimentar">Plano Alimentar</SelectItem>
                    <SelectItem value="plano_treino">Plano de Treino</SelectItem>
                    <SelectItem value="plano_comportamental">Plano Comportamental</SelectItem>
                    <SelectItem value="plano_geral">Plano Geral</SelectItem>
                    <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                    <SelectItem value="reabilitacao_cardiaca">Reabilitação Cardíaca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Textarea
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (dias)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Orientações e Regras</Label>
                <Textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  rows={4}
                  placeholder="Ex: Evitar alimentos processados, beber 2L de água por dia..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo Detalhado (JSON)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder='{"items": ["Item 1", "Item 2"]}'
                />
                <p className="text-xs text-muted-foreground">Formato JSON para conteúdo estruturado</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Prescrição Ativa</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Prescrição"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/patient/${patientId}`)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
