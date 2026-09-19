import { Link } from "@inertiajs/react";
import { Eye, EyeOff, Info, Smartphone } from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import RAVULogo from "../../Components/RAVULogo";
import {
    Button,
    CheckList,
    Container,
    Eyebrow,
    PatternBackdrop,
} from "../../Components/ui";

const FIELD =
    "mt-2 w-full rounded-lg border-ink-300 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-ravu-600 focus:outline-none focus:ring-2 focus:ring-ravu-200";

export default function Register() {
    const [visible, setVisible] = useState(false);

    return (
        <WebsiteLayout>
            <div className="grid lg:min-h-[42rem] lg:grid-cols-2">
                {/* ------------------------------------------------ BRAND PANEL */}
                <div className="relative hidden overflow-hidden bg-ink-950 p-12 lg:flex lg:items-center xl:p-16">
                    <PatternBackdrop tone="dark" />
                    <div
                        aria-hidden="true"
                        className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-ravu-600/25 blur-3xl"
                    />
                    <div className="relative max-w-md">
                        <RAVULogo variant="light" markSize="lg" />
                        <Eyebrow tone="light" className="mt-10">
                            Register interest
                        </Eyebrow>
                        <h1 className="mt-4 text-4xl font-black leading-[1.06] tracking-tight text-white xl:text-5xl">
                            A stronger journey starts with connection.
                        </h1>
                        <p className="mt-6 text-base leading-7 text-ink-300">
                            Register your interest in the membership-based
                            mobility ecosystem.
                        </p>

                        <CheckList
                            tone="light"
                            className="mt-8"
                            items={[
                                "Hear first as membership becomes available.",
                                "Stay informed about the growing ecosystem.",
                                "No membership fees are collected here.",
                            ]}
                        />
                    </div>
                </div>

                {/* ------------------------------------------------------- FORM */}
                <div className="flex items-center bg-white">
                    <Container size="narrow" className="py-14 sm:py-16">
                        <div className="mx-auto w-full max-w-md">
                            <Link
                                href="/"
                                aria-label="RAVU home"
                                className="inline-block rounded-md lg:hidden"
                            >
                                <RAVULogo />
                            </Link>

                            <h1 className="mt-8 text-3xl font-black tracking-tight lg:mt-0">
                                Register interest
                            </h1>
                            <p className="mt-2 text-sm text-ink-600">
                                Be among the people building the RAVU
                                ecosystem.
                            </p>

                            <div className="mt-7 flex gap-3 rounded-lg border-ravu-200 bg-ravu-50 p-4">
                                <Info
                                    size={18}
                                    className="mt-0.5 shrink-0 text-ravu-700"
                                    aria-hidden="true"
                                />
                                <p className="text-xs leading-5 text-ravu-900">
                                    This records your interest only. Full
                                    membership onboarding is still being
                                    developed, and submission will be connected
                                    once the backend membership flow is
                                    available.
                                </p>
                            </div>

                            <form
                                className="mt-7 space-y-4"
                                onSubmit={(event) => event.preventDefault()}
                            >
                                <div>
                                    <label
                                        htmlFor="register-name"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Full name
                                    </label>
                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        className={FIELD}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="register-email"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className={FIELD}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="register-phone"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Phone number
                                    </label>
                                    <input
                                        id="register-phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        className={FIELD}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="register-password"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={
                                                visible ? "text" : "password"
                                            }
                                            autoComplete="new-password"
                                            className={`${FIELD} pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVisible((v) => !v)
                                            }
                                            className="absolute inset-y-0 right-3 my-auto grid h-8 w-8 place-items-center rounded-md text-ink-500 transition-colors hover:text-ink-900"
                                            aria-label={
                                                visible
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {visible ? (
                                                <EyeOff
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <label className="flex items-start gap-2.5 text-sm leading-6 text-ink-600">
                                    <input
                                        type="checkbox"
                                        name="consent"
                                        className="mt-1 h-4 w-4 shrink-0 rounded border-ink-300 text-ravu-600 focus:ring-ravu-500"
                                    />
                                    <span>
                                        I agree to be contacted about RAVU
                                        membership.
                                    </span>
                                </label>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled
                                    aria-disabled="true"
                                >
                                    Register interest
                                </Button>
                            </form>

                            <div className="mt-6 flex items-start gap-3 rounded-lg border-ink-200 bg-ink-50 p-4">
                                <Smartphone
                                    size={18}
                                    className="mt-0.5 shrink-0 text-ravu-700"
                                    aria-hidden="true"
                                />
                                <p className="text-xs leading-5 text-ink-600">
                                    Are you a rider or driver? Operational
                                    onboarding happens in the{" "}
                                    <Link
                                        href="/for-riders"
                                        className="font-bold text-ravu-700 transition-colors hover:text-ravu-800"
                                    >
                                        RAVU app
                                    </Link>
                                    , not here.
                                </p>
                            </div>

                            <p className="mt-6 text-sm text-ink-600">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-bold text-ravu-700 transition-colors hover:text-ravu-800"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </Container>
                </div>
            </div>
        </WebsiteLayout>
    );
}
