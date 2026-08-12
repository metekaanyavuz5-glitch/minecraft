import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-8">
        <h1 className="font-mono text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-white/60">Free, local, no external services required.</p>
        <div className="mt-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
