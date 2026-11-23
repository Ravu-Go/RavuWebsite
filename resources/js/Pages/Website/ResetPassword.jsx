import { Link, useForm } from "@inertiajs/react";
import WebsiteLayout from "../../Components/WebsiteLayout";

export default function ResetPassword({ email = "", token }) {
    const { data, setData, post, processing, errors } = useForm({ email, token, password: "", password_confirmation: "" });
    const submit = (event) => { event.preventDefault(); post("/password/reset"); };

    return (
        <WebsiteLayout>
            <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-5 py-16">
                <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
                    <h1 className="text-2xl font-black text-slate-950">Choose a new password</h1>
                    <p className="mt-2 text-sm text-slate-600">Use at least 12 characters, including letters and numbers.</p>
                    {Object.values(errors).map((error, index) => <p key={index} className="mt-3 text-sm text-rose-600">{error}</p>)}
                    <label className="mt-6 block text-xs font-bold uppercase tracking-wide text-slate-700">Business email<input type="email" required value={data.email} onChange={(e) => setData("email", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900" /></label>
                    <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-700">New password<input type="password" autoComplete="new-password" required value={data.password} onChange={(e) => setData("password", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900" /></label>
                    <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-700">Confirm new password<input type="password" autoComplete="new-password" required value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900" /></label>
                    <button disabled={processing} className="mt-6 w-full rounded-xl bg-[#1864E8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3B8C] disabled:opacity-50">{processing ? "Updating…" : "Update password"}</button>
                    <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-slate-600">Back to sign in</Link>
                </form>
            </section>
        </WebsiteLayout>
    );
}
