import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string | null;
  profiles: {
    full_name: string;
  } | null;
}

export default function UpcomingAppointmentsWidget({ professionalId }: { professionalId: string }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [professionalId]);

  const fetchAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("*")
        .eq("professional_id", professionalId)
        .gte("appointment_date", today)
        .in("status", ["pending", "confirmed"])
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(5);

      if (!appointmentsData) {
        setAppointments([]);
        return;
      }

      // Fetch patient profiles
      const patientIds = appointmentsData.map(a => a.patient_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);

      const enrichedAppointments = appointmentsData.map(apt => ({
        ...apt,
        profiles: profiles?.find(p => p.id === apt.patient_id) || null
      }));

      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
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
        <CardTitle>Próximos Agendamentos</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")}>
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum agendamento próximo</p>
        ) : (
          appointments.map(apt => (
            <div key={apt.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{apt.profiles?.full_name}</span>
                  <Badge className={getStatusColor(apt.status)}>
                    {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </Badge>
                </div>
                {apt.appointment_type && (
                  <p className="text-sm text-muted-foreground capitalize">{apt.appointment_type}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(apt.appointment_date), "dd/MM/yyyy")}
                  <Clock className="h-3 w-3 ml-2" />
                  {apt.appointment_time}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
