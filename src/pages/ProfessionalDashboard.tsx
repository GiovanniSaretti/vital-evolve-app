import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RecentActivitiesWidget from "@/components/professional/RecentActivitiesWidget";
import UpcomingAppointmentsWidget from "@/components/professional/UpcomingAppointmentsWidget";
import PrescriptionRenewalsWidget from "@/components/professional/PrescriptionRenewalsWidget";
import { 
  Users, 
  ClipboardList, 
  Activity, 
  MessageSquare, 
  Calendar,
  FileText,
  TrendingUp,
  Bell,
  LogOut,
  Settings
} from "lucide-react";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [professional, setProfessional] = useState<any>(null);
  const [stats, setStats] = useState({
    activePatients: 0,
    pendingRequests: 0,
    activePrescriptions: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is a professional
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isProfessional = roles?.some(r => r.role === "professional");

      if (!isProfessional) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }

      // Get professional data
      const { data: profData } = await supabase
        .from("health_professionals")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfessional(profData);

      // Get stats
      if (profData) {
        const { count: activeCount } = await supabase
          .from("professional_patients")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", profData.id)
          .eq("status", "active");

        const { count: pendingCount } = await supabase
          .from("professional_patients")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", profData.id)
          .eq("status", "pending");

        const { count: prescriptionCount } = await supabase
          .from("prescriptions")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", profData.id)
          .eq("active", true);

        setStats({
          activePatients: activeCount || 0,
          pendingRequests: pendingCount || 0,
          activePrescriptions: prescriptionCount || 0,
          unreadMessages: 0
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BioFit Pro
            </h1>
            <p className="text-sm text-muted-foreground">
              Olá, Dr(a). {professional?.full_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover-scale cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatients}</div>
              <p className="text-xs text-muted-foreground">Total de pacientes em acompanhamento</p>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <ClipboardList className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Aguardando sua aprovação</p>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Prescrições Ativas</CardTitle>
              <FileText className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrescriptions}</div>
              <p className="text-xs text-muted-foreground">Planos em andamento</p>
            </CardContent>
          </Card>

          <Card className="hover-scale cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">Não lidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="card-elegant hover-scale cursor-pointer"
            onClick={() => navigate("/patients")}
          >
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Meus Pacientes</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Acessar</Button>
            </CardContent>
          </Card>

          <Card
            className="card-elegant hover-scale cursor-pointer"
            onClick={() => navigate("/appointments")}
          >
            <CardHeader>
              <ClipboardList className="h-8 w-8 text-warning mb-2" />
              <CardTitle>Solicitações</CardTitle>
              <CardDescription>
                Aceite ou recuse pedidos de acompanhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Ver Solicitações</Button>
            </CardContent>
          </Card>

          <Card className="card-elegant hover-scale cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-success mb-2" />
              <CardTitle>Prescrições</CardTitle>
              <CardDescription>
                Crie e gerencie planos personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Gerenciar</Button>
            </CardContent>
          </Card>

          <Card className="card-elegant hover-scale cursor-pointer">
            <CardHeader>
              <Activity className="h-8 w-8 text-info mb-2" />
              <CardTitle>Evolução dos Pacientes</CardTitle>
              <CardDescription>
                Acompanhe métricas e progresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Ver Evolução</Button>
            </CardContent>
          </Card>

          <Card
            className="card-elegant hover-scale cursor-pointer"
            onClick={() => navigate("/messages")}
          >
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Chat com Pacientes</CardTitle>
              <CardDescription>
                Mensagens e comunicação direta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Abrir Chat</Button>
            </CardContent>
          </Card>

            <Card className="card-elegant hover-scale cursor-pointer">
            <CardHeader>
              <Calendar className="h-8 w-8 text-success mb-2" />
              <CardTitle>Agenda</CardTitle>
              <CardDescription>
                Gerencie consultas e atendimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate("/appointments")}>Ver Agenda</Button>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {professional && (
            <>
              <RecentActivitiesWidget professionalId={professional.id} />
              <UpcomingAppointmentsWidget professionalId={professional.id} />
              <PrescriptionRenewalsWidget professionalId={professional.id} />
            </>
          )}
        </div>

        {/* Professional Info */}
        {professional && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Seu Perfil Profissional</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Profissão</p>
                <p className="font-medium capitalize">{professional.profession?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registro</p>
                <p className="font-medium">{professional.license_number} - {professional.license_state}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modalidade</p>
                <p className="font-medium capitalize">{professional.attendance_mode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-medium ${professional.verified ? "text-success" : "text-warning"}`}>
                  {professional.verified ? "✓ Verificado" : "⏳ Aguardando verificação"}
                </p>
              </div>
              {professional.specialties && professional.specialties.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((spec: string) => (
                      <span key={spec} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
