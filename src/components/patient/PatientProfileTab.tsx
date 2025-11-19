import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Activity, Target, Ruler, Clock } from "lucide-react";

interface PatientProfileTabProps {
  profile: {
    full_name: string;
    birth_date: string | null;
    height: number | null;
    current_weight: number | null;
    goal_weight: number | null;
    initial_weight: number | null;
    treatment_start_date: string | null;
    activity_level: number | null;
    dietary_restrictions: string | null;
  };
}

export function PatientProfileTab({ profile }: PatientProfileTabProps) {
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Não informado";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calculateBMI = () => {
    if (!profile.height || !profile.current_weight) return null;
    const heightInMeters = profile.height / 100;
    return (profile.current_weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome Completo</p>
            <p className="font-medium">{profile.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Nascimento
            </p>
            <p className="font-medium">
              {formatDate(profile.birth_date)}
              {profile.birth_date && ` (${calculateAge(profile.birth_date)} anos)`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Início do Tratamento
            </p>
            <p className="font-medium">{formatDate(profile.treatment_start_date)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Medidas e Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Altura
            </p>
            <p className="font-medium">
              {profile.height ? `${profile.height} cm` : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Peso Inicial</p>
            <p className="font-medium">
              {profile.initial_weight ? `${profile.initial_weight} kg` : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Peso Atual</p>
            <p className="font-medium">
              {profile.current_weight ? `${profile.current_weight} kg` : "Não informado"}
              {calculateBMI() && <span className="text-sm text-muted-foreground ml-2">(IMC: {calculateBMI()})</span>}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Peso Meta
            </p>
            <p className="font-medium">
              {profile.goal_weight ? `${profile.goal_weight} kg` : "Não informado"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Nível de Atividade e Restrições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nível de Atividade</p>
            <p className="font-medium">
              {profile.activity_level !== null ? `${profile.activity_level}/10` : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Restrições Alimentares</p>
            <p className="font-medium">{profile.dietary_restrictions || "Nenhuma restrição informada"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
