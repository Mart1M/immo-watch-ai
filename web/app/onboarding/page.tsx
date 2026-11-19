import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { onboardingDone } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Onboarding() {
  if (await onboardingDone()) redirect("/");
  return <div className="shell"><OnboardingForm /></div>;
}
