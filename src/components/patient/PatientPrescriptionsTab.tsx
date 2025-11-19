import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Calendar, Eye } from "lucide-react";

interface Prescription {
  id: string;
  title: string;
  type: string;
  description: string | null;
  active: boolean;
  created_at: string;
  duration_days: number | null;
  professional: {
    full_name: string;
    profession: string;
  };
}

interface PatientPrescriptionsTabProps {
  patientId: string;
  isProfessional: boolean;
}

export function PatientPrescriptionsTab({ patientId, isProfessional }: PatientPrescriptionsTabProps) {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          id,
          title,
          type,
          description,
          active,
          created_at,
          duration_days,
          professional:professional_id (
            full_name,
            profession
          )
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPrescriptions(data || []);
    } catch (error: any) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Erro ao carregar prescrições");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getPrescriptionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      diet: "Dieta",
      workout: "Treino",
      medication: "Medicação",
      supplement: "Suplementação",
      lifestyle: "Estilo de Vida",
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma prescrição encontrada</p>
          </CardContent>
        </Card>
      ) : (
        prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {prescription.title}
                    {prescription.active ? (
                      <Badge>Ativa</Badge>
                    ) : (
                      <Badge variant="outline">Inativa</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {getPrescriptionTypeLabel(prescription.type)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(prescription.created_at)}
                    </span>
                    {prescription.duration_days && (
                      <span>{prescription.duration_days} dias</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/prescription/${prescription.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardHeader>
            {prescription.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{prescription.description}</p>
                <p className="text-sm mt-2">
                  <strong>Profissional:</strong> {prescription.professional.full_name} ({prescription.professional.profession})
                </p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
