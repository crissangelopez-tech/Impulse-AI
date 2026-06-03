/**
 * ConfiguracionPage — Cambiar nombre, contraseña, empresa y eliminar cuenta.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save, KeyRound, UserRound, AlertTriangle, Trash2 } from "lucide-react";

export default function ConfiguracionPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/user/profile", { name, company });
      updateUser(data);
      toast.success("Perfil actualizado");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos guardar");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    try {
      await api.put("/user/password", {
        current_password: currentPass,
        new_password: newPass,
      });
      toast.success("Contraseña actualizada");
      setCurrentPass("");
      setNewPass("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "No pudimos actualizar la contraseña");
    } finally {
      setSavingPass(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/user/account");
      await logout();
      toast.success("Cuenta eliminada");
      navigate("/");
    } catch {
      toast.error("No pudimos eliminar la cuenta");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10" data-testid="configuracion-page">
      <header>
        <div className="label-eyebrow">Configuración</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
          Tu cuenta
        </h1>
        <p className="mt-2 text-zinc-500">Administra tus datos personales y de acceso.</p>
      </header>

      {/* Perfil */}
      <Card className="card-surface flex flex-col gap-6 border-none p-8 md:flex-row md:items-start md:gap-10 md:p-10">
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-zinc-100 md:grid">
          <UserRound className="h-6 w-6 text-zinc-700" />
        </div>
        <form onSubmit={handleProfileSave} className="w-full space-y-5" data-testid="profile-form">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Perfil</h2>
            <p className="text-sm text-zinc-500">Nombre y empresa visibles en tu dashboard.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-name" className="label-eyebrow">
              Nombre completo
            </Label>
            <Input
              id="cfg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-lg bg-zinc-50"
              required
              data-testid="cfg-name-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cfg-company" className="label-eyebrow">
              Empresa
            </Label>
            <Input
              id="cfg-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-12 rounded-lg bg-zinc-50"
              required
              data-testid="cfg-company-input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="label-eyebrow">Correo</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="h-12 rounded-lg bg-zinc-100 text-zinc-500"
              data-testid="cfg-email-input"
            />
            <p className="text-xs text-zinc-400">El correo no se puede cambiar.</p>
          </div>
          <Button
            type="submit"
            disabled={savingProfile}
            className="btn-shine h-11 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
            data-testid="cfg-save-profile-btn"
          >
            {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Contraseña */}
      <Card className="card-surface flex flex-col gap-6 border-none p-8 md:flex-row md:items-start md:gap-10 md:p-10">
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-zinc-100 md:grid">
          <KeyRound className="h-6 w-6 text-zinc-700" />
        </div>
        <form onSubmit={handlePasswordChange} className="w-full space-y-5" data-testid="password-form">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Contraseña</h2>
            <p className="text-sm text-zinc-500">
              {user?.auth_provider === "google" && !user?.password_hash
                ? "Iniciaste con Google. Puedes establecer una contraseña para login con email."
                : "Cambia tu contraseña regularmente para mantener tu cuenta segura."}
            </p>
          </div>
          {user?.password_hash !== null && user?.auth_provider !== "google" && (
            <div className="space-y-1.5">
              <Label htmlFor="cfg-current" className="label-eyebrow">
                Contraseña actual
              </Label>
              <Input
                id="cfg-current"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="h-12 rounded-lg bg-zinc-50"
                required
                data-testid="cfg-current-pass-input"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="cfg-new" className="label-eyebrow">
              Nueva contraseña
            </Label>
            <Input
              id="cfg-new"
              type="password"
              minLength={6}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="h-12 rounded-lg bg-zinc-50"
              required
              data-testid="cfg-new-pass-input"
            />
          </div>
          <Button
            type="submit"
            disabled={savingPass}
            className="btn-shine h-11 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
            data-testid="cfg-save-pass-btn"
          >
            {savingPass ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            Actualizar contraseña
          </Button>
        </form>
      </Card>

      <Separator />

      {/* Eliminar cuenta */}
      <Card className="border-red-200 bg-red-50/30 p-8 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-zinc-950">Eliminar cuenta</h2>
              <p className="mt-1 max-w-md text-sm text-zinc-600">
                Esta acción es permanente. Todos tus proyectos e historial serán eliminados.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-full" data-testid="cfg-delete-btn">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar mi cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Borraremos tu perfil, tus planes y tu historial. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Eliminar definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
