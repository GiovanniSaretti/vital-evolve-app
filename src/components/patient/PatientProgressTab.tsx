import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PatientProgressTabProps {
  patientId: string;
}

export function PatientProgressTab({ patientId }: PatientProgressTabProps) {
  const [weightData, setWeightData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    totalWeightLost: 0,
    percentageToGoal: 0,
  });

  useEffect(() => {
    fetchProgressData();
  }, [patientId]);

  const fetchProgressData = async () => {
    try {
      // Fetch profile for initial and goal weight
      const { data: profile } = await supabase
        .from("profiles")
        .select("initial_weight, goal_weight, current_weight")
        .eq("id", patientId)
        .single();

      // Fetch weight measurements
      const { data: measurements } = await supabase
        .from("measurements")
        .select("weight, measurement_date")
        .eq("user_id", patientId)
        .not("weight", "is", null)
        .order("measurement_date", { ascending: true });

      if (measurements && measurements.length > 0) {
        const formattedData = measurements.map((m) => ({
          date: new Date(m.measurement_date).toLocaleDateString("pt-BR", {
            month: "short",
            day: "numeric",
          }),
          peso: Number(m.weight),
        }));
        setWeightData(formattedData);

        // Calculate progress
        if (profile?.initial_weight && profile?.current_weight) {
          const weightLost = profile.initial_weight - profile.current_weight;
          let percentageToGoal = 0;

          if (profile.goal_weight) {
            const totalToLose = profile.initial_weight - profile.goal_weight;
            percentageToGoal = (weightLost / totalToLose) * 100;
          }

          setProgress({
            totalWeightLost: weightLost,
            percentageToGoal: Math.round(percentageToGoal),
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching progress data:", error);
      toast.error("Erro ao carregar progresso");
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
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Perdido</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.totalWeightLost > 0 ? `${progress.totalWeightLost.toFixed(1)} kg` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Desde o início do tratamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso da Meta</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress.percentageToGoal > 0 ? `${progress.percentageToGoal}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Em direção ao objetivo</p>
          </CardContent>
        </Card>
      </div>

      {weightData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Peso (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma medição de peso registrada ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
