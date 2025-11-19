import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Activity, UtensilsCrossed, Pill, Dumbbell, Smile } from "lucide-react";

interface PatientHealthMetricsTabProps {
  patientId: string;
}

export function PatientHealthMetricsTab({ patientId }: PatientHealthMetricsTabProps) {
  const [metrics, setMetrics] = useState({
    recentMeals: 0,
    recentWorkouts: 0,
    activeMedications: 0,
    latestMood: null as number | null,
    latestWeight: null as number | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [patientId]);

  const fetchMetrics = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch recent meals
      const { count: mealsCount } = await supabase
        .from("meals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", patientId)
        .gte("meal_date", sevenDaysAgo.toISOString());

      // Fetch recent workouts
      const { count: workoutsCount } = await supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", patientId)
        .gte("workout_date", sevenDaysAgo.toISOString());

      // Fetch active medications
      const { count: medicationsCount } = await supabase
        .from("medications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", patientId)
        .gte("application_date", sevenDaysAgo.toISOString());

      // Fetch latest mood
      const { data: moodData } = await supabase
        .from("mood_logs")
        .select("mood_score")
        .eq("user_id", patientId)
        .order("log_date", { ascending: false })
        .limit(1)
        .single();

      // Fetch latest weight
      const { data: measurementData } = await supabase
        .from("measurements")
        .select("weight")
        .eq("user_id", patientId)
        .order("measurement_date", { ascending: false })
        .limit(1)
        .single();

      setMetrics({
        recentMeals: mealsCount || 0,
        recentWorkouts: workoutsCount || 0,
        activeMedications: medicationsCount || 0,
        latestMood: moodData?.mood_score || null,
        latestWeight: measurementData?.weight || null,
      });
    } catch (error: any) {
      console.error("Error fetching metrics:", error);
      toast.error("Erro ao carregar métricas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refeições (7 dias)</CardTitle>
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.recentMeals}</div>
          <p className="text-xs text-muted-foreground">Refeições registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Treinos (7 dias)</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.recentWorkouts}</div>
          <p className="text-xs text-muted-foreground">Treinos realizados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medicações (7 dias)</CardTitle>
          <Pill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeMedications}</div>
          <p className="text-xs text-muted-foreground">Aplicações registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Humor Recente</CardTitle>
          <Smile className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.latestMood !== null ? `${metrics.latestMood}/10` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Último registro</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.latestWeight !== null ? `${metrics.latestWeight} kg` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Última medição</p>
        </CardContent>
      </Card>
    </div>
  );
}
