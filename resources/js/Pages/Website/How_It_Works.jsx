import { Building2, UsersRound } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import {
    CTASection,
    EcosystemSection,
    Hero,
} from "../../Components/sections";
import {
    Container,
    Reveal,
    SectionTitle,
    StepCard,
} from "../../Components/ui";

const JOURNEY = [
    {
        title: "Discover RAVU",
        text: "Understand the membership ecosystem and where you fit.",
    },
    {
        title: "Register",
        text: "Share your interest in becoming part of RAVU.",
    },
    {
        title: "Become a member",
        text: "Complete the membership journey when available.",
    },
    {
        title: "Access the ecosystem",
        text: "Explore relevant benefits, partners and support.",
    },
    {
        title: "Participate",
        text: "Build connections through the community.",
    },
    {
        title: "Grow with RAVU",
        text: "Move forward with a stronger mobility journey.",
    },
];

export default function HowItWorks() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="How it works"
                title="A simple path into a connected mobility ecosystem."
                text="RAVU brings members, riders, partners and community together through one clear journey — discover, join, connect and grow."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
            />

            {/* --------------------------------------------------- THE JOURNEY */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="The journey"
                            title="Discover. Join. Connect. Grow."
                            text="Six steps, each building on the last."
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

            {/* ---------------------------------------------- MEMBERS AT CENTRE */}
            <section className="border-y border-ink-200 bg-ink-50 py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Who the ecosystem is built around"
                            title="Members at the centre. Partners in the ecosystem."
                            align="center"
                        />
                    </Reveal>

                    <div className="mt-12 grid gap-5 lg:grid-cols-2">
                        <Reveal>
                            <div className="h-full rounded-xl border-ink-200 bg-white p-8">
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-ravu-50 text-ravu-700">
                                    <UsersRound size={21} aria-hidden="true" />
                                </span>
                                <h3 className="mt-5 text-xl font-bold text-ink-950">
                                    Members at the Centre
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-ink-600">
                                    RAVU starts with people and connects the
                                    services around them. Every part of the
                                    ecosystem exists to serve the person at the
                                    centre of it.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <div className="h-full rounded-xl border-ink-200 bg-white p-8">
                                <span className="grid h-11 w-11 place-items-center rounded-lg bg-ravu-50 text-ravu-700">
                                    <Building2 size={21} aria-hidden="true" />
                                </span>
                                <h3 className="mt-5 text-xl font-bold text-ink-950">
                                    Partners in the Ecosystem
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-ink-600">
                                    Partners contribute relevant support,
                                    services and opportunities — making the
                                    ecosystem genuinely useful to members.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </Container>
            </section>

            <EcosystemSection tone="dark" />

            <CTASection
                eyebrow="Start your journey"
                title="Find your place in RAVU."
                text="Members join through the app. Organisations partner with RAVU directly."
                primary={{ label: "Get the RAVU App", href: "/for-riders" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
            />
        </WebsiteLayout>
    );
}
