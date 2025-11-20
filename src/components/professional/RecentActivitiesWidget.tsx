import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'meal' | 'workout' | 'medication' | 'appointment' | 'prescription';
  patientName: string;
  description: string;
  timestamp: string;
}

export default function RecentActivitiesWidget({ professionalId }: { professionalId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [professionalId]);

  const fetchActivities = async () => {
    try {
      // Get active patients
      const { data: patientRelations } = await supabase
        .from("professional_patients")
        .select("patient_id")
        .eq("professional_id", professionalId)
        .eq("status", "active");

      if (!patientRelations) return;

      const patientIds = patientRelations.map(p => p.patient_id);

      // Get patient profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds);

      const patients = patientRelations.map(pr => ({
        patient_id: pr.patient_id,
        profiles: profiles?.find(p => p.id === pr.patient_id)
      }));

      const activitiesList: ActivityItem[] = [];

      // Fetch recent meals
      const { data: meals } = await supabase
        .from("meals")
        .select("id, user_id, meal_date, meal_type, food_items")
        .in("user_id", patientIds)
        .order("meal_date", { ascending: false })
        .limit(5);

      meals?.forEach(meal => {
        const patient = patients.find(p => p.patient_id === meal.user_id);
        activitiesList.push({
          id: meal.id,
          type: 'meal',
          patientName: patient?.profiles?.full_name || 'Paciente',
          description: `Registrou ${meal.meal_type || 'refeição'}: ${meal.food_items.slice(0, 50)}...`,
          timestamp: meal.meal_date
        });
      });

      // Fetch recent workouts
      const { data: workouts } = await supabase
        .from("workouts")
        .select("id, user_id, workout_date, workout_type, duration_minutes")
        .in("user_id", patientIds)
        .order("workout_date", { ascending: false })
        .limit(5);

      workouts?.forEach(workout => {
        const patient = patients.find(p => p.patient_id === workout.user_id);
        activitiesList.push({
          id: workout.id,
          type: 'workout',
          patientName: patient?.profiles?.full_name || 'Paciente',
          description: `Treino de ${workout.workout_type} - ${workout.duration_minutes} min`,
          timestamp: workout.workout_date
        });
      });

      // Sort by timestamp
      activitiesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activitiesList.slice(0, 10));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meal': return <Activity className="h-4 w-4 text-success" />;
      case 'workout': return <Activity className="h-4 w-4 text-primary" />;
      case 'appointment': return <Calendar className="h-4 w-4 text-info" />;
      case 'prescription': return <FileText className="h-4 w-4 text-warning" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade recente</p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="mt-1">{getIcon(activity.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.patientName}</span>
                  <Badge variant="outline" className="text-xs capitalize">{activity.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.timestamp), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
