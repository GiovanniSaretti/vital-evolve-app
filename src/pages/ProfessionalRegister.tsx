import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, ArrowLeft, Upload } from "lucide-react";

const professionTypes = [
  { value: "nutricionista", label: "Nutricionista" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "educador_fisico", label: "Educador Físico" },
  { value: "cardiologista", label: "Cardiologista" },
  { value: "endocrinologista", label: "Endocrinologista" },
  { value: "clinico_geral", label: "Clínico Geral" },
  { value: "psicologo", label: "Psicólogo" },
  { value: "nefrologista", label: "Nefrologista" },
  { value: "ortopedista", label: "Ortopedista" },
  { value: "personal_trainer", label: "Personal Trainer" },
  { value: "outro", label: "Outro" }
];

const attendanceModes = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "hibrido", label: "Híbrido" }
];

const specialtiesList = [
  "Emagrecimento", "Ganho de massa", "Reabilitação", "Esportes",
  "Gestantes", "Idosos", "Crianças", "Performance", "Saúde cardiovascular"
];

export default function ProfessionalRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Auth data
    email: "",
    password: "",
    confirmPassword: "",
    // Personal data
    fullName: "",
    cpf: "",
    birthdate: "",
    gender: "",
    phone: "",
    // Professional data
    profession: "",
    licenseNumber: "",
    licenseState: "",
    experienceYears: "",
    attendanceMode: "presencial",
    // Clinic data
    clinicName: "",
    clinicAddress: "",
    clinicHours: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ title: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName || !formData.cpf || !formData.phone) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.profession || !formData.licenseNumber || !formData.licenseState) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          },
          emailRedirectTo: `${window.location.origin}/professional-dashboard`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // 2. Create professional profile
      const { error: profileError } = await supabase
        .from("health_professionals")
        .insert([{
          user_id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          birthdate: formData.birthdate || null,
          gender: formData.gender || null,
          cpf: formData.cpf,
          profession: formData.profession as any,
          license_number: formData.licenseNumber,
          license_state: formData.licenseState,
          experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
          specialties: selectedSpecialties,
          attendance_mode: formData.attendanceMode as any,
          clinic_name: formData.clinicName || null,
          clinic_address: formData.clinicAddress || null,
          clinic_hours: formData.clinicHours || null
        }]);

      if (profileError) throw profileError;

      // 3. Assign professional role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: authData.user.id,
          role: "professional" as any
        }]);

      if (roleError) throw roleError;

      toast({
        title: "✅ Cadastro realizado com sucesso!",
        description: "Você será redirecionado para o dashboard profissional."
      });

      setTimeout(() => navigate("/professional-dashboard"), 2000);
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-glow">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cadastro Profissional
          </CardTitle>
          <CardDescription>
            Passo {step} de 4 - {step === 1 ? "Dados de acesso" : step === 2 ? "Dados pessoais" : step === 3 ? "Dados profissionais" : "Informações da clínica"}
          </CardDescription>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Data de Nascimento</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleInputChange("birthdate", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="profession">Área de Atuação *</Label>
                <Select value={formData.profession} onValueChange={(value) => handleInputChange("profession", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionTypes.map(prof => (
                      <SelectItem key={prof.value} value={prof.value}>
                        {prof.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Nº do Registro *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="CRM, CRN, CREF..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseState">UF do Registro *</Label>
                  <Input
                    id="licenseState"
                    value={formData.licenseState}
                    onChange={(e) => handleInputChange("licenseState", e.target.value)}
                    placeholder="SP, RJ, MG..."
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Anos de Experiência</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                  placeholder="Ex: 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendanceMode">Modalidade de Atendimento</Label>
                <Select value={formData.attendanceMode} onValueChange={(value) => handleInputChange("attendanceMode", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceModes.map(mode => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Especialidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {specialtiesList.map(specialty => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={() => toggleSpecialty(specialty)}
                      />
                      <label htmlFor={specialty} className="text-sm cursor-pointer">
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange("clinicName", e.target.value)}
                  placeholder="Nome da sua clínica ou consultório"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Endereço da Clínica</Label>
                <Input
                  id="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicHours">Horário de Atendimento</Label>
                <Input
                  id="clinicHours"
                  value={formData.clinicHours}
                  onChange={(e) => handleInputChange("clinicHours", e.target.value)}
                  placeholder="Ex: Seg-Sex 8h-18h"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={handleNextStep} className="flex-1">
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Cadastrando..." : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
