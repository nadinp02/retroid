import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { listUsers } from "@/services/users";

export default async function UsuariosPage() {
  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <SectionHeading>Usuarios</SectionHeading>
        <p className="text-sm text-muted-foreground">Cuentas con acceso al panel administrativo.</p>
      </div>

      <WindowPanel title="USUARIOS" bodyClassName="p-4">
        <div className="overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {new Intl.DateTimeFormat("es-AR").format(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </WindowPanel>
    </div>
  );
}
