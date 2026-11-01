import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-16 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-[28rem] rounded-full bg-lime-400/10 blur-3xl"
      />
      <section className="relative mx-auto w-full max-w-5xl">
        <nav className="mb-24 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight">
            GMS<span className="text-lime-400">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Sign in
            </Link>
            <Button className="bg-lime-400 font-semibold text-zinc-950 hover:bg-lime-300">
              <Link href="/register">Join the gym</Link>
            </Button>
          </div>
        </nav>
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-lime-400">
            Your training starts here
          </p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            Show up.
            <br />
            Get stronger<span className="text-lime-400">.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
            Create your gym account to get started, or sign in to pick up where
            your training left off.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-lime-400 font-semibold text-zinc-950 hover:bg-lime-300"
            >
              <Link href="/register">Create your account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
