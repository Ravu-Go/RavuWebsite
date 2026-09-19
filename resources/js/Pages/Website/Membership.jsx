import { BadgeCheck, CreditCard, UsersRound } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import { CTASection } from "../../Components/sections";
import {
    Button,
    CheckList,
    Container,
    Eyebrow,
    Reveal,
    SectionTitle,
    StepCard,
} from "../../Components/ui";
import riderIdImage from "../../../imgs/ravuRiderID.png";

const MEANING = [
    "Access to relevant benefits as they become available.",
    "Connection to ecosystem partners and services.",
    "A mobility community built around participation.",
    "Participation and progress within a growing ecosystem.",
];

const JOURNEY = [
    { title: "Register", text: "Share your interest in joining RAVU." },
    {
        title: "Apply",
        text: "Complete the membership process when available.",
    },
    {
        title: "Verification",
        text: "Receive clear guidance on next steps.",
    },
    { title: "Participate", text: "Connect with the ecosystem." },
    {
        title: "Access benefits",
        text: "Explore relevant available benefits.",
    },
    { title: "Grow", text: "Move forward with community." },
];

export default function Membership() {
    return (
        <WebsiteLayout>
            {/* ------------------------------------------------------------ HERO */}
            <section className="relative overflow-hidden border-b border-ink-200 bg-white">
                <div
                    aria-hidden="true"
                    className="ravu-mesh pointer-events-none absolute inset-0"
                />
                <div
                    aria-hidden="true"
                    className="ravu-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
                />

                <Container className="relative py-14 sm:py-16 lg:py-20">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <div className="ravu-reveal">
                            <Eyebrow>RAVU Membership</Eyebrow>
                            <h1 className="mt-4 text-[2.1rem] font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                                Membership that moves with you.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg sm:leading-8">
                                A RAVU membership connects you to a growing
                                ecosystem of support, benefits and community
                                built around your mobility journey.
                            </p>
                            <div className="mt-8 gap-3 sm:flex sm:flex-wrap sm:items-center">
                                <Button href="/register" size="lg">
                                    Register Interest
                                </Button>
                                <Button
                                    href="/benefits"
                                    size="lg"
                                    variant="outline"
                                >
                                    See Benefits
                                </Button>
                            </div>
                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-ink-400">
                                Join. Save. Earn.
                            </p>
                        </div>

                        <div className="ravu-reveal ravu-reveal-delay-2 relative mx-auto w-full max-w-sm sm:max-w-md">
                            <div
                                aria-hidden="true"
                                className="absolute inset-6 rounded-[2rem] bg-ravu-500/15 blur-2xl"
                            />
                            <div className="relative rounded-xl border-ink-200 bg-white p-2.5 shadow-sm">
                                <img
                                    src={riderIdImage}
                                    alt="Example RAVU Rider Member ID card"
                                    loading="lazy"
                                    decoding="async"
                                    className="block w-full rounded-lg"
                                />
                            </div>
                            <div className="absolute -bottom-4 -left-3 rounded-lg bg-ink-950 px-4 py-3 shadow-sm sm:-left-6">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ravu-400">
                                    Member access
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    Your RAVU journey starts here
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* -------------------------------------------------- WHAT IT MEANS */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <Reveal>
                            <SectionTitle
                                eyebrow="What it means"
                                title="A place in the ecosystem."
                                text="Membership is designed for people who want to participate in a stronger mobility community — and benefit from it as the ecosystem develops."
                            />
                            <CheckList className="mt-8" items={MEANING} />
                        </Reveal>

                        <Reveal delay={0.08}>
                            <div className="h-full rounded-xl border-ink-200 bg-ink-50 p-8 sm:p-9">
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-ravu-50 text-ravu-700">
                                    <CreditCard size={21} aria-hidden="true" />
                                </span>
                                <h3 className="mt-6 text-xl font-bold text-ink-950">
                                    Your membership, made visible.
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-ink-600">
                                    A RAVU Rider Member ID represents
                                    connection to the people, support and
                                    opportunities that make up the ecosystem.
                                </p>

                                <div className="mt-6 border-t border-ink-200 pt-6">
                                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-ravu-700">
                                        <BadgeCheck
                                            size={21}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <h3 className="mt-5 text-xl font-bold text-ink-950">
                                        Built to grow with you.
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-ink-600">
                                        Membership is an entry point, not an
                                        end state. As partner services and
                                        ecosystem benefits become available,
                                        members are connected to them.
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </Container>
            </section>

            {/* ---------------------------------------------------- ENGINE NOTE */}
            <section className="border-y border-ink-200 bg-ink-50 py-12">
                <Container>
                    <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-ravu-700">
                            <UsersRound size={21} aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-ink-950">
                                Membership is being rolled out step by step.
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-600">
                                Full membership onboarding and the benefits
                                attached to it are still being developed.
                                Registration currently records your interest,
                                and RAVU will communicate clearly as each stage
                                becomes available. No membership fees or
                                benefit terms are published here until they are
                                confirmed.
                            </p>
                        </div>
                    </Reveal>
                </Container>
            </section>

            {/* -------------------------------------------------- MEMBER JOURNEY */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Member journey"
                            title="A clear route into RAVU."
                            text="Six steps, in plain language."
                            align="center"
                        />
                    </Reveal>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {JOURNEY.map((step, index) => (
                            <Reveal key={step.title} delay={index * 0.05}>
                                <StepCard index={index} title={step.title}>
                                    {step.text}
                                </StepCard>
                            </Reveal>
                        ))}
                    </div>
                </Container>
            </section>

            <CTASection
                eyebrow="Get started"
                title="Register your interest in RAVU."
                text="Share your details and RAVU will keep you informed as membership becomes available."
                primary={{ label: "Register Interest", href: "/register" }}
                secondary={{
                    label: "Get the RAVU App",
                    href: "/for-riders",
                }}
            />
        </WebsiteLayout>
    );
}
