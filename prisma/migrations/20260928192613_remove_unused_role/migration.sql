-- El enum Role (ADMIN/OPERATOR) nunca se usaba para restringir nada: solo el
-- dueño del negocio y el desarrollador acceden al panel, y ambos necesitan
-- permisos completos. Se decidió sacar el modelo de roles en vez de dejar
-- RBAC a medio implementar sin necesidad comercial real.
-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";
