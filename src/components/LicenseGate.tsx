import { useEffect, useState, type ReactNode } from "react";
import { checkLicense, enterLicense } from "@/lib/license.functions";
import megatronVideo from "@/assets/megatron.mp4.asset.json";

type Phase = "checking" | "locked" | "ok";

export function LicenseGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let alive = true;
    const run = () =>
      checkLicense()
        .then((r) => alive && setPhase((p) => (r.ok ? "ok" : p === "ok" ? (location.reload(), "locked") : "locked")))
        .catch(() => alive && setPhase((p) => (p === "ok" ? "ok" : "locked")));
    run();
    const i = setInterval(run, 5 * 60 * 1000); // re-check so a changed code logs devices out
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);

  if (phase === "ok") return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <video className="license-video" src={megatronVideo.url} autoPlay muted loop playsInline aria-hidden="true" />
      <div className="license-veil" aria-hidden="true" />
      <div className="panel relative z-10 w-full max-w-sm text-center backdrop-blur-md">
        <div className="font-display text-2xl font-bold tracking-wider glow-text">MEGATRON AI</div>
        {phase === "checking" ? (
          <p className="mt-4 animate-pulse text-sm text-muted-foreground">Checking the license code…</p>
        ) : (
          <form
            className="mt-4 space-y-3 text-left"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setErr("");
              try {
                const r = await enterLicense({ data: { code } });
                if (r.ok) setPhase("ok");
                else setErr("Incorrect license code");
              } catch {
                setErr("Could not check the code. Try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block">
              <span className="field-label">Enter license code</span>
              <div className="relative">
              <input
                className="input pr-16"
                type={show ? "text" : "password"}
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-xs font-semibold text-primary hover:bg-muted"
                aria-label={show ? "Hide license code" : "Show license code"}
              >
                {show ? "Hide" : "Show"}
              </button>
              </div>
            </label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button className="btn-primary w-full" disabled={busy || !code}>
              {busy ? "Checking…" : "Unlock"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
