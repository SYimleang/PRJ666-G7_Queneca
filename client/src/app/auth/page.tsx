import AuthForm from "@/components/AuthForm";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
