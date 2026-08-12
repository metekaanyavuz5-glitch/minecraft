import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrlRaw = params?.callbackUrl;
  const callbackUrl = typeof callbackUrlRaw === "string" ? callbackUrlRaw : "/dashboard";

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-8">
        <h1 className="font-mono text-xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-white/60">Log in to keep building.</p>
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
