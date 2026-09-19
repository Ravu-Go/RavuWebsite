import { Link } from "@inertiajs/react";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import RAVULogo from "../../Components/RAVULogo";
import {
    Button,
    Container,
    Eyebrow,
    PatternBackdrop,
} from "../../Components/ui";

const FIELD =
    "mt-2 w-full rounded-lg border-ink-300 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-400 focus:border-ravu-600 focus:outline-none focus:ring-2 focus:ring-ravu-200";

export default function Login() {
    const [visible, setVisible] = useState(false);

    return (
        <WebsiteLayout>
            <div className="grid lg:min-h-[38rem] lg:grid-cols-2">
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
                            Welcome back
                        </Eyebrow>
                        <h1 className="mt-4 text-4xl font-black leading-[1.06] tracking-tight text-white xl:text-5xl">
                            Keep moving forward with RAVU.
                        </h1>
                        <p className="mt-6 text-base leading-7 text-ink-300">
                            Your RAVU account connects you with the membership
                            ecosystem as services become available.
                        </p>
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
                                Sign in
                            </h1>
                            <p className="mt-2 text-sm text-ink-600">
                                Access your RAVU account.
                            </p>

                            <div className="mt-7 flex gap-3 rounded-lg border-ravu-200 bg-ravu-50 p-4">
                                <Info
                                    size={18}
                                    className="mt-0.5 shrink-0 text-ravu-700"
                                    aria-hidden="true"
                                />
                                <p className="text-xs leading-5 text-ravu-900">
                                    Authentication is not yet configured on the
                                    RAVU platform. This form is a UI preview and
                                    does not submit or store credentials.
                                </p>
                            </div>

                            <form
                                className="mt-7 space-y-5"
                                onSubmit={(event) => event.preventDefault()}
                                aria-describedby="login-status"
                            >
                                <div>
                                    <label
                                        htmlFor="login-identifier"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Email or phone
                                    </label>
                                    <input
                                        id="login-identifier"
                                        name="identifier"
                                        type="text"
                                        autoComplete="username"
                                        className={FIELD}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="text-sm font-bold text-ink-900"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            name="password"
                                            type={
                                                visible ? "text" : "password"
                                            }
                                            autoComplete="current-password"
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

                                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                    <label className="flex items-center gap-2 text-ink-700">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            className="h-4 w-4 rounded border-ink-300 text-ravu-600 focus:ring-ravu-500"
                                        />
                                        Remember me
                                    </label>
                                    <span className="text-ink-400">
                                        Password recovery coming soon
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled
                                    aria-disabled="true"
                                >
                                    Sign in
                                </Button>
                            </form>

                            <p
                                id="login-status"
                                className="mt-6 text-sm text-ink-600"
                            >
                                New to RAVU?{" "}
                                <Link
                                    href="/register"
                                    className="font-bold text-ravu-700 transition-colors hover:text-ravu-800"
                                >
                                    Register interest
                                </Link>
                            </p>
                        </div>
                    </Container>
                </div>
            </div>
        </WebsiteLayout>
    );
}
