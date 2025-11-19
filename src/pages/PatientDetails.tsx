import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, User, Activity, FileText, TrendingUp, Plus } from "lucide-react";
import { PatientProfileTab } from "@/components/patient/PatientProfileTab";
import { PatientHealthMetricsTab } from "@/components/patient/PatientHealthMetricsTab";
import { PatientPrescriptionsTab } from "@/components/patient/PatientPrescriptionsTab";
import { PatientProgressTab } from "@/components/patient/PatientProgressTab";

interface PatientProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  birth_date: string | null;
  height: number | null;
  current_weight: number | null;
  goal_weight: number | null;
  initial_weight: number | null;
  treatment_start_date: string | null;
  activity_level: number | null;
  dietary_restrictions: string | null;
}

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    checkAccessAndFetchData();
  }, [patientId]);

  const checkAccessAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is a professional with access to this patient
      const { data: professional } = await supabase
        .from("health_professionals")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (professional) {
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
        setIsProfessional(true);
      }

      // Fetch patient profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .single();

      if (error) throw error;

      setProfile(profileData);
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
      toast.error("Erro ao carregar dados do paciente");
      navigate("/patients");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-muted-foreground">Detalhes do Paciente</p>
              </div>
            </div>
          </div>
          {isProfessional && (
            <Button onClick={() => navigate(`/patient/${patientId}/prescribe`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Prescrições
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <PatientProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="metrics">
            <PatientHealthMetricsTab patientId={patientId!} />
          </TabsContent>

          <TabsContent value="prescriptions">
            <PatientPrescriptionsTab patientId={patientId!} isProfessional={isProfessional} />
          </TabsContent>

          <TabsContent value="progress">
            <PatientProgressTab patientId={patientId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
