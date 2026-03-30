import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="container py-12">
      <section aria-label="로그인 폼">
        <AuthForm />
      </section>
    </main>
  );
}

