import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { invoke } from "../api/client";
import { CreditCard, Trash, Check, RefreshCw, Plus } from "./icons";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PK ?? "pk_test_51OS1BLC6sgrexYUAg9gl48dTWwdgV9WhpzwAYL318cpQi0NW3DuFIyJUDas6FRZgwua0DP8SgpfmEwJ3aDH8zaVx00TH3eKey2"
);

const CARD_STYLE = {
  style: {
    base: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "15px",
      color: "#0E1116",
      "::placeholder": { color: "#5B6478" },
    },
    invalid: { color: "#ef4444" },
  },
};

function AddCardForm({ onAdded }: { onAdded: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setErr(""); setBusy(true);
    try {
      const { client_secret } = await invoke("create_setup_intent", {});
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("card element missing");
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: { card },
      });
      if (result.error) throw new Error(result.error.message);
      setDone(true);
      setTimeout(() => { setDone(false); onAdded(); }, 1500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-ink/[0.08] bg-bg p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.18em] text-muted">Add new card</p>
      <div className="rounded-xl border border-ink/[0.10] bg-surface px-4 py-3 shadow-soft">
        <CardElement options={CARD_STYLE} />
      </div>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={busy || done || !stripe}
        className="btn mt-4 inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
      >
        {done ? <><Check className="h-4 w-4" /> Saved!</> :
         busy ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> :
         <><Plus className="h-4 w-4" /> Save card</>}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted">
        Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>
    </form>
  );
}

interface Card {
  guid: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export function MyCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await invoke("list_cards", {});
      setCards(res?.cards ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(cardId: string) {
    await invoke("delete_card", { card_id: cardId });
    load();
  }

  async function setDefault(cardId: string) {
    await invoke("set_default_card", { card_id: cardId });
    load();
  }

  const brandIcon: Record<string, string> = {
    visa: "💳 Visa",
    mastercard: "💳 Mastercard",
    amex: "💳 Amex",
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-lg font-semibold text-ink">My cards</h3>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="ghost inline-flex items-center gap-1.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            {showAdd ? "Cancel" : "Add card"}
          </button>
        </div>

        {showAdd && (
          <AddCardForm onAdded={() => { setShowAdd(false); load(); }} />
        )}

        {/* card list */}
        <div className="mt-4 space-y-2">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="h-16 animate-shimmer rounded-2xl bg-[length:200%_100%] bg-gradient-to-r from-ink/5 via-ink/10 to-ink/5" />
            ))
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-bg px-6 py-10 text-center">
              <CreditCard className="h-8 w-8 text-muted" />
              <p className="text-sm text-muted">No saved cards yet.</p>
            </div>
          ) : (
            cards.map((c) => (
              <div
                key={c.guid}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition ${
                  c.is_default
                    ? "border-brand-300 bg-brand-50 shadow-glow"
                    : "border-ink/[0.08] bg-surface"
                }`}
              >
                <CreditCard className={`h-6 w-6 shrink-0 ${c.is_default ? "text-brand-600" : "text-muted"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink text-sm">
                    {brandIcon[c.brand] ?? `💳 ${c.brand}`} •••• {c.last4}
                  </div>
                  <div className="text-xs text-muted">
                    Expires {c.exp_month}/{c.exp_year}
                    {c.is_default && <span className="ml-2 text-brand-600 font-semibold">· Default</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!c.is_default && (
                    <button
                      onClick={() => setDefault(c.guid)}
                      className="ghost p-2 text-xs text-muted hover:text-brand-600"
                      title="Set as default"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(c.guid)}
                    className="ghost p-2 text-muted hover:text-red-500"
                    title="Remove"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Elements>
  );
}

/** Inline pay-with-saved-card button for use in deal rows */
export function PayWithCardButton({ dealId, onPaid }: { dealId: string; onPaid: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setBusy(true); setErr("");
    try {
      const res = await invoke("pay_with_saved_card", { deal_id: dealId });
      if (res?.status === "succeeded") onPaid();
      else setErr(res?.status ?? "payment pending");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={pay}
        disabled={busy}
        className="ghost inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50"
      >
        {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
        Saved card
      </button>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
    </div>
  );
}
