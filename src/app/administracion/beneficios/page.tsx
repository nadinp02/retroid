import { listBenefits } from "@/services/benefits";
import { BenefitsAdminView } from "@/features/benefits/benefits-admin-view";

export default async function BeneficiosPage() {
  const benefits = await listBenefits();

  return <BenefitsAdminView benefits={benefits} />;
}
