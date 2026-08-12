import { NewProjectForm } from "@/components/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-lg w-full px-4 sm:px-6 py-12">
      <h1 className="font-mono text-2xl font-bold">New project</h1>
      <p className="mt-1 text-white/60">Give it a name and a theme -- you can generate as many textures and structures inside it as you like.</p>
      <div className="mt-8 border border-white/10 bg-white/[0.02] p-6">
        <NewProjectForm />
      </div>
    </div>
  );
}
