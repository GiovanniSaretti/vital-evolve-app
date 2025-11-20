import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface Prescription {
  id: string;
  patient_id: string;
  title: string;
  type: string;
  created_at: string;
  duration_days: number | null;
  profiles: {
    full_name: string;
  } | null;
}

export default function PrescriptionRenewalsWidget({ professionalId }: { professionalId: string }) {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [professionalId]);

  const fetchPrescriptions = async () => {
    try {
      const { data: prescriptionsData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("active", true)
        .not("duration_days", "is", null)
        .order("created_at", { ascending: true });

      if (!prescriptionsData) {
        setPrescriptions([]);
        return;
      }

      // Filter prescriptions expiring in next 30 days
      const expiringPrescriptions = prescriptionsData.filter(p => {
        if (!p.duration_days) return false;
        const expiryDate = addDays(new Date(p.created_at), p.duration_days);
        const daysUntilExpiry = differenceInDays(expiryDate, new Date());
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
      });

      // Fetch patient profiles
      const patientIds = expiringPrescriptions.map(p => p.patient_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);

      const enrichedPrescriptions = expiringPrescriptions.map(presc => ({
        ...presc,
        profiles: profiles?.find(p => p.id === presc.patient_id) || null
      }));

      setPrescriptions(enrichedPrescriptions.slice(0, 5));
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (createdAt: string, durationDays: number) => {
    const expiryDate = addDays(new Date(createdAt), durationDays);
    return differenceInDays(expiryDate, new Date());
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'bg-destructive/10 text-destructive';
    if (daysLeft <= 14) return 'bg-warning/10 text-warning';
    return 'bg-info/10 text-info';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescrições para Renovar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prescrições para Renovar</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")}>
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma prescrição expirando em breve</p>
        ) : (
          prescriptions.map(presc => {
            const daysLeft = getDaysUntilExpiry(presc.created_at, presc.duration_days!);
            return (
              <div key={presc.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <FileText className="h-5 w-5 text-warning mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{presc.profiles?.full_name}</span>
                    <Badge className={getUrgencyColor(daysLeft)}>
                      {daysLeft === 0 ? 'Expira hoje' : `${daysLeft} dias`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{presc.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    Expira em {format(addDays(new Date(presc.created_at), presc.duration_days!), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
