import { Link, useForm } from "@inertiajs/react";
import WebsiteLayout from "../../Components/WebsiteLayout";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: "" });
    const submit = (event) => { event.preventDefault(); post("/password/forgot"); };

    return (
        <WebsiteLayout>
            <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-5 py-16">
                <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
                    <h1 className="text-2xl font-black text-slate-950">Reset your password</h1>
                    <p className="mt-2 text-sm text-slate-600">We’ll email a secure reset link if an account exists for that address.</p>
                    {status && <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}
                    {errors.email && <p className="mt-4 text-sm text-rose-600">{errors.email}</p>}
                    <label className="mt-6 block text-xs font-bold uppercase tracking-wide text-slate-700">Business email<input type="email" autoComplete="email" required value={data.email} onChange={(e) => setData("email", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 focus:border-[#1864E8] focus:outline-none" /></label>
                    <button disabled={processing} className="mt-5 w-full rounded-xl bg-[#1864E8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3B8C] disabled:opacity-50">{processing ? "Sending…" : "Send reset link"}</button>
                    <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-slate-600">Back to sign in</Link>
                </form>
            </section>
        </WebsiteLayout>
    );
}
