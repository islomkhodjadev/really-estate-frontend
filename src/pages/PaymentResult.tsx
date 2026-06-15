import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { invoke } from "../api/client";
import { CheckCircle, Clock, RefreshCw, CreditCard, ArrowRight, X } from "../components/icons";

export function PaymentSuccess() {
  const [sp] = useSearchParams();
  const sid = sp.get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "pending" | "error">("loading");
  const [info, setInfo] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!sid) { setState("error"); setErr("missing session"); return; }
    invoke("confirm_payment", { session_id: sid })
      .then((res) => { setInfo(res); setState(res?.paid ? "ok" : "pending"); })
      .catch((e) => { setErr(e.message); setState("error"); });
  }, [sid]);

  return (
    <div className="container animate-fade-up flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md rounded-3xl p-8 text-center shadow-card sm:p-10">
        {state === "loading" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <CreditCard className="h-8 w-8 animate-pulse" />
            </div>
            <h1 className="font-display mt-5 text-2xl font-semibold text-ink">Confirming payment</h1>
            <p className="font-sans mt-2 text-muted">Hang tight while we verify your transaction…</p>
          </>
        )}

        {state === "ok" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-glow">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="font-display mt-5 text-2xl font-semibold text-ink">Payment successful</h1>
            <p className="font-sans mt-2 text-muted">
              {info?.amount ? (
                <>
                  <span className="font-stat tabular-nums text-ink">${Number(info.amount).toLocaleString()}</span> received.{" "}
                </>
              ) : null}
              The deal is now completed.
            </p>
            <Link to="/dashboard" className="btn mt-7 inline-flex items-center gap-2">
              Back to dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {state === "pending" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Clock className="h-8 w-8" />
            </div>
            <h1 className="font-display mt-5 text-2xl font-semibold text-ink">Payment pending</h1>
            <p className="font-sans mt-2 text-muted">We couldn't confirm it as paid yet.</p>
            <Link to="/dashboard" className="btn mt-7 inline-flex items-center gap-2">
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h1 className="font-display mt-5 text-2xl font-semibold text-ink">Couldn't confirm</h1>
            <div className="font-sans mt-3 rounded-2xl border border-ink/[0.08] bg-bg px-4 py-3 text-sm text-accent">{err}</div>
            <Link to="/dashboard" className="btn mt-7 inline-flex items-center gap-2">
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function PaymentCancel() {
  return (
    <div className="container animate-fade-up flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md rounded-3xl p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.06] text-muted">
          <X className="h-8 w-8" />
        </div>
        <h1 className="font-display mt-5 text-2xl font-semibold text-ink">Payment cancelled</h1>
        <p className="font-sans mt-2 text-muted">No charge was made.</p>
        <Link to="/dashboard" className="btn mt-7 inline-flex items-center gap-2">
          Back to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
