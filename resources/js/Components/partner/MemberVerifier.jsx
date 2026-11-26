import { router } from "@inertiajs/react";
import axios from "axios";
import { AlertCircle, AlertTriangle, BadgePercent, CheckCircle2, Clock, Loader2, QrCode, ReceiptText, Search, ShieldAlert, UserRound, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDate, formatDateTime, money } from "../admin/reportKit";

/* ==========================================================================
   Serve a member: verify a RAVU member at the counter, then record the visit
   with the member discount. The server re-checks the member on "Record".
   ========================================================================== */

const m = money("TZS");
const digits = (v) => String(v ?? "").replace(/\D/g, "");
const grouped = (v) => (v === "" ? "" : Number(v).toLocaleString("en"));

const RESULT = {
    eligible: { icon: CheckCircle2, title: "Active RAVU member", tone: "border-emerald-200 bg-emerald-50 text-emerald-900", iconTone: "text-emerald-600" },
    expired: { icon: Clock, title: "Membership expired", tone: "border-amber-200 bg-amber-50 text-amber-900", iconTone: "text-amber-600" },
    suspended: { icon: ShieldAlert, title: "Membership suspended", tone: "border-rose-200 bg-rose-50 text-rose-900", iconTone: "text-rose-600" },
    not_found: { icon: XCircle, title: "No member found", tone: "border-rose-200 bg-rose-50 text-rose-900", iconTone: "text-rose-600" },
    no_offer: { icon: AlertTriangle, title: "Offer awaiting approval", tone: "border-amber-200 bg-amber-50 text-amber-900", iconTone: "text-amber-600" },
    unavailable: { icon: AlertCircle, title: "Lookup unavailable", tone: "border-slate-200 bg-slate-50 text-slate-800", iconTone: "text-slate-500" },
};

function computeDiscount(offer, bill, manual) {
    if (!offer || !bill) return 0;
    if (offer.type === "percentage_discount") return Math.round((bill * (offer.percentage || 0)) / 100);
    if (offer.type === "fixed_discount") return Math.min(bill, offer.amount || 0);
    return Math.min(bill, Number(manual || 0));
}

export default function MemberVerifier({ serving, recent = [] }) {
    const [query, setQuery] = useState("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({ bill: "", discount: "", location: "", description: "", invoice: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const inputRef = useRef(null);
    const billRef = useRef(null);

    useEffect(() => inputRef.current?.focus(), []);

    const reset = () => {
        setQuery("");
        setResult(null);
        setReceipt(null);
        setErrors({});
        setForm({ bill: "", discount: "", location: "", description: "", invoice: "" });
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const verify = async (event, value = query) => {
        event?.preventDefault();
        const q = value.trim();
        if (!q) return;
        setChecking(true);
        setReceipt(null);
        setErrors({});
        try {
            const { data } = await axios.post("/partner/members/verify", { query: q });
            setResult(data);
            if (data.eligible) setTimeout(() => billRef.current?.focus(), 0);
        } catch (error) {
            setResult(error.response?.data?.reason ? error.response.data : { reason: "unavailable", message: error.response?.data?.message || "Could not reach RAVU. Check your connection and try again." });
        } finally {
            setChecking(false);
        }
    };

    const offer = result?.offer;
    const bill = Number(form.bill || 0);
    const discount = computeDiscount(offer, bill, form.discount);
    const pays = Math.max(0, bill - discount);

    const record = async (event) => {
        event.preventDefault();
        setSaving(true);
        setErrors({});
        try {
            const { data } = await axios.post("/partner/redemptions", {
                member_ref: result.member.member_ref,
                bill_amount: bill,
                discount_amount: offer?.manual_discount ? Number(form.discount || 0) : null,
                partner_location_id: form.location || null,
                description: form.description || null,
                invoice_ref: form.invoice || null,
            });
            setReceipt(data.redemption);
            router.reload({ only: ["performance", "redemptions", "payouts"] });
        } catch (error) {
            const bag = error.response?.data?.errors;
            setErrors(bag ? Object.fromEntries(Object.entries(bag).map(([k, v]) => [k, v[0]])) : { general: error.response?.data?.message || "The visit could not be recorded. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const kind = result ? (result.eligible ? "eligible" : result.reason) : null;
    const look = kind ? RESULT[kind] || RESULT.unavailable : null;
    const member = result?.member;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
                {/* Lookup */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1864E8]/10 text-[#1864E8]">
                            <QrCode size={20} />
                        </span>
                        <div>
                            <h2 className="text-lg font-black text-slate-950">Serve a RAVU member</h2>
                            <p className="mt-0.5 text-[13px] text-slate-600">
                                Scan or type the member pass from the member’s RAVU app (RVU-…), or type their Member ID or phone number.
                                {serving.offer && (
                                    <>
                                        {" "}Your offer: <strong className="text-slate-900">{serving.offer.label}</strong>.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={verify} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                        <label htmlFor="member-query" className="sr-only">Member ID, phone or QR code</label>
                        <div className="relative flex-1">
                            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="member-query"
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={serving.demo_members ? "RAVU-10432 or 0754 123 456" : "RVU-… pass, RAVU-00042 or 0754 123 456"}
                                autoComplete="off"
                                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-[15px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15"
                            />
                        </div>
                        <button type="submit" disabled={checking || !query.trim()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#08152F] px-6 text-sm font-black text-white transition hover:bg-[#13254a] disabled:cursor-not-allowed disabled:opacity-50">
                            {checking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            Verify member
                        </button>
                    </form>

                    {serving.demo_members && serving.sample_members?.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500">
                            <span className="font-semibold text-amber-700">Sample members:</span>
                            {serving.sample_members.map((s) => (
                                <button
                                    key={s.member_ref}
                                    type="button"
                                    onClick={() => {
                                        setQuery(s.member_ref);
                                        verify(null, s.member_ref);
                                    }}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11.5px] text-slate-700 hover:border-slate-300 hover:bg-white"
                                >
                                    {s.member_ref}
                                    {s.status !== "active" && <span className="ml-1 font-sans text-slate-400">({s.status})</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Result */}
                {result && look && (
                    <section className={`rounded-3xl border p-5 sm:p-6 ${look.tone}`} aria-live="polite">
                        <div className="flex items-start gap-3">
                            <look.icon size={22} className={`mt-0.5 shrink-0 ${look.iconTone}`} />
                            <div className="min-w-0">
                                <p className="text-base font-black">{look.title}</p>
                                <p className="mt-0.5 text-[13px] opacity-90">{result.message}</p>
                            </div>
                        </div>

                        {member && (
                            <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-white p-4 text-slate-900 ring-1 ring-black/5 sm:flex-row sm:p-5">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
                                    {member.photo_url ? <img src={member.photo_url} alt={`Photo of ${member.name}`} className="h-full w-full object-cover" /> : <UserRound size={34} />}
                                </div>
                                <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:grid-cols-3">
                                    <div className="col-span-2 sm:col-span-3">
                                        <dt className="sr-only">Name</dt>
                                        <dd className="text-lg font-black leading-tight">{member.name}</dd>
                                        <dd className="font-mono text-[12.5px] text-slate-500">{member.member_ref}</dd>
                                    </div>
                                    <Detail label="Plan" value={member.plan_name} />
                                    <Detail label="Vehicle" value={member.vehicle_category} />
                                    <Detail label="Plate" value={member.plate_number} mono />
                                    <Detail label="Phone" value={member.phone_masked} mono />
                                    <Detail label={member.status === "active" ? "Valid until" : "Ended"} value={formatDate(member.valid_until)} />
                                    <Detail label="Member since" value={formatDate(member.member_since, { month: "short", year: "numeric" })} />
                                    <Detail label="Visits here" value={result.history?.visits ? `${result.history.visits} · last ${formatDate(result.history.last_visit_at)}` : "First visit"} />
                                </dl>
                            </div>
                        )}
                        {member && (
                            <p className="mt-3 text-[12px] opacity-80">Check the face and plate number match the person in front of you before applying the discount.</p>
                        )}
                    </section>
                )}

                {/* Record */}
                {result?.eligible && !receipt && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-7">
                        <h3 className="flex items-center gap-2 text-base font-black text-slate-950">
                            <BadgePercent size={18} className="text-[#1864E8]" /> Record this visit
                        </h3>
                        {result.history?.recent_duplicate && (
                            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900 ring-1 ring-amber-600/20">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> This member was recorded at your business in the last few minutes. Make sure this is a new purchase.
                            </p>
                        )}
                        <form onSubmit={record} className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Field label="Bill amount before discount (TSh)" error={errors.bill_amount} className="sm:col-span-2">
                                <input
                                    ref={billRef}
                                    inputMode="numeric"
                                    value={grouped(form.bill)}
                                    onChange={(e) => setForm({ ...form, bill: digits(e.target.value).slice(0, 9) })}
                                    placeholder="e.g. 45,000"
                                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-lg font-black text-slate-900 focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15"
                                    required
                                />
                            </Field>
                            {offer?.manual_discount && (
                                <Field label="Discount given (TSh)" error={errors.discount_amount} hint={`${offer.label}: enter the value the member saved.`}>
                                    <input inputMode="numeric" value={grouped(form.discount)} onChange={(e) => setForm({ ...form, discount: digits(e.target.value).slice(0, 9) })} className="h-11 w-full rounded-xl border border-slate-300 px-3 font-semibold focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15" />
                                </Field>
                            )}
                            {serving.locations?.length > 1 && (
                                <Field label="Branch" error={errors.partner_location_id}>
                                    <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-semibold focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15">
                                        {serving.locations.map((l, i) => (
                                            <option key={l.id} value={i === 0 ? "" : l.id}>{l.name}{l.district ? ` · ${l.district}` : ""}</option>
                                        ))}
                                    </select>
                                </Field>
                            )}
                            <Field label="What did the member buy? (optional)" error={errors.description}>
                                <input value={form.description} maxLength={160} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Brake pads + labour" className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15" />
                            </Field>
                            <Field label="Your invoice / receipt no. (optional)" error={errors.invoice_ref}>
                                <input value={form.invoice} maxLength={60} onChange={(e) => setForm({ ...form, invoice: e.target.value })} className="h-11 w-full rounded-xl border border-slate-300 px-3 focus:border-[#1864E8] focus:outline-none focus:ring-4 focus:ring-[#1864E8]/15" />
                            </Field>

                            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                                <Line label="Bill" value={m.full(bill)} />
                                <Line label={`Member discount${offer?.label ? ` (${offer.label})` : ""}`} value={`− ${m.full(discount)}`} tone="text-emerald-700" />
                                <div className="mt-2 border-t border-slate-200 pt-2">
                                    <Line label="Member pays" value={m.full(pays)} strong />
                                </div>
                            </div>

                            {(errors.member_ref || errors.general) && <p className="text-[13px] font-semibold text-rose-700 sm:col-span-2">{errors.member_ref || errors.general}</p>}

                            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={reset} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving || bill < 100} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1864E8] px-6 text-sm font-black text-white transition hover:bg-[#1453c4] disabled:cursor-not-allowed disabled:opacity-50">
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Record visit · member pays {m.full(pays)}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Receipt */}
                {receipt && (
                    <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs sm:p-7" aria-live="polite">
                        <div className="flex items-start gap-3">
                            <ReceiptText size={22} className="mt-0.5 shrink-0 text-emerald-600" />
                            <div>
                                <p className="text-base font-black text-slate-950">Visit recorded</p>
                                <p className="mt-0.5 text-[13px] text-slate-600">
                                    Receipt <span className="font-mono font-bold text-slate-900">{receipt.receipt_no}</span> · {receipt.member_name} ({receipt.member_ref}) · {formatDateTime(receipt.redeemed_at)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center" style={{ fontVariantNumeric: "tabular-nums" }}>
                            <Figure label="Bill" value={m.full(receipt.bill)} />
                            <Figure label="Member saved" value={m.full(receipt.discount)} />
                            <Figure label="Member paid" value={m.full(receipt.paid)} strong />
                        </div>
                        <button type="button" onClick={reset} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#08152F] px-5 text-sm font-black text-white hover:bg-[#13254a]">
                            Serve next member
                        </button>
                    </section>
                )}
            </div>

            {/* Side panel */}
            <aside className="space-y-5 lg:col-span-4">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">At the counter</h3>
                    <ol className="mt-3 list-decimal space-y-2 pl-4 text-[13px] text-slate-600">
                        <li>Ask for the RAVU Member ID or QR code in the member’s app.</li>
                        <li>Verify it here and check the name, photo and plate.</li>
                        <li>Enter the bill. The discount is calculated for you.</li>
                        <li>Record the visit. Every visit counts towards your monthly RAVU payout.</li>
                    </ol>
                    <p className="mt-3 text-[12px] text-slate-500">Recorded something by mistake? Void it from <strong>Redemptions</strong> within {serving.void_window_hours} hours.</p>
                </section>
                {recent.length > 0 && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Latest visits</h3>
                        <ul className="mt-3 divide-y divide-slate-100">
                            {recent.slice(0, 6).map((r) => (
                                <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                                    <div className="min-w-0">
                                        <p className={`truncate font-semibold ${r.status === "voided" ? "text-slate-400 line-through" : "text-slate-800"}`}>{r.member_name}</p>
                                        <p className="text-[11.5px] text-slate-500">{formatDateTime(r.redeemed_at)}</p>
                                    </div>
                                    <span className="shrink-0 font-semibold text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{m.full(r.paid)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </aside>
        </div>
    );
}

function Detail({ label, value, mono = false }) {
    return (
        <div>
            <dt className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
            <dd className={`mt-0.5 font-semibold text-slate-900 ${mono ? "font-mono text-[12.5px]" : ""}`}>{value || "—"}</dd>
        </div>
    );
}

function Field({ label, error, hint, className = "", children }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-[12px] font-bold text-slate-700">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-[11.5px] text-slate-500">{hint}</span>}
            {error && <span className="mt-1 block text-[12px] font-semibold text-rose-700">{error}</span>}
        </label>
    );
}

function Line({ label, value, tone = "text-slate-900", strong = false }) {
    return (
        <div className="flex items-baseline justify-between gap-3 py-0.5 text-[13.5px]">
            <span className="text-slate-600">{label}</span>
            <span className={`${tone} ${strong ? "text-lg font-black" : "font-semibold"}`}>{value}</span>
        </div>
    );
}

function Figure({ label, value, strong = false }) {
    return (
        <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`mt-0.5 ${strong ? "text-base font-black text-slate-950" : "font-semibold text-slate-800"}`}>{value}</p>
        </div>
    );
}
