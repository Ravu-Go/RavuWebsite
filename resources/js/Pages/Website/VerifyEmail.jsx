import { Link, router } from "@inertiajs/react";
import WebsiteLayout from "../../Components/WebsiteLayout";

export default function VerifyEmail({ status }) {
    return (
        <WebsiteLayout>
            <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-5 py-16">
                <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1864E8]">Verify your email</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">One quick step before onboarding.</h1>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">We sent a secure verification link to your business email. Open it to confirm the address and continue your RAVU partner application.</p>
                    {status && <p role="status" className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{status}</p>}
                    <button type="button" onClick={() => router.post("/email/verification-notification")} className="mt-7 w-full rounded-xl bg-[#1864E8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0B3B8C]">Resend verification link</button>
                    <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-slate-600 hover:text-slate-950">Return to sign in</Link>
                </div>
            </section>
        </WebsiteLayout>
    );
}
