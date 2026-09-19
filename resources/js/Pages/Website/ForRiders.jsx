import {
    BadgeCheck,
    Handshake,
    Smartphone,
    UsersRound,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import { AppPromo, CTASection, Hero } from "../../Components/sections";
import {
    Button,
    Card,
    CardGrid,
    CheckList,
    Container,
    Eyebrow,
    Reveal,
    SectionTitle,
    StepCard,
} from "../../Components/ui";
import riderImage from "../../../imgs/rider.png";

const SUPPORT_AREAS = [
    {
        icon: BadgeCheck,
        title: "Membership access",
        text: "Connect with benefits and services as the RAVU ecosystem grows.",
    },
    {
        icon: Wrench,
        title: "Practical support",
        text: "Discover mobility-focused support designed around everyday operations.",
    },
    {
        icon: Handshake,
        title: "Community",
        text: "Be part of a connected mobility community.",
    },
];

const RIDER_JOURNEY = [
    {
        title: "Download the app",
        text: "The RAVU app is the starting point for riders and drivers.",
    },
    {
        title: "Register in the app",
        text: "Complete your details where the operational experience lives.",
    },
    {
        title: "Access your membership",
        text: "Use membership access, services and support as they become available.",
    },
    {
        title: "Participate and grow",
        text: "Build connections and move forward with the wider ecosystem.",
    },
];

export default function ForRiders() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="For riders & drivers"
                title="A stronger ride starts with a stronger ecosystem."
                text="RAVU begins with the boda boda and motorcycle communities whose work keeps people and places connected — and grows outward from there."
                primary={{ label: "Get the RAVU App", href: "/for-riders#app" }}
                secondary={{
                    label: "Learn About Membership",
                    href: "/membership",
                }}
                media={riderImage}
                mediaAlt="RAVU rider in branded kit on a RAVU motorcycle"
                layout="split"
            />

            {/* -------------------------------------------------- WHAT YOU GET */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="What RAVU means for riders"
                            title="Support for the journey beyond the next trip."
                            text="RAVU is designed around the everyday realities of mobility work — and the opportunity to build something more from it."
                        />
                    </Reveal>

                    <CardGrid className="mt-12">
                        {SUPPORT_AREAS.map((area, index) => (
                            <Reveal key={area.title} delay={index * 0.08}>
                                <Card icon={area.icon} title={area.title}>
                                    {area.text}
                                </Card>
                            </Reveal>
                        ))}
                    </CardGrid>
                </Container>
            </section>

            {/* ------------------------------------------- APP IS THE FRONT DOOR */}
            <section className="border-y border-ink-200 bg-ink-50 py-16 sm:py-20 lg:py-24">
                <Container>
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <Reveal>
                            <Eyebrow>The RAVU app is where you join</Eyebrow>
                            <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.4rem]">
                                Riders primarily join and use RAVU through the
                                mobile app.
                            </h2>
                            <p className="mt-5 text-base leading-7 text-ink-600 sm:text-lg">
                                This website introduces RAVU — the membership,
                                the ecosystem and the opportunity. The app is
                                where the operational experience happens:
                                registration, membership access, services and
                                the day-to-day tools built around your work.
                            </p>
                            <div className="mt-8">
                                <Button href="/for-riders#app" size="lg">
                                    Get the RAVU App
                                </Button>
                            </div>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <div className="rounded-xl border-ink-200 bg-white p-7 sm:p-8">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ravu-700">
                                    What to expect
                                </p>
                                <CheckList
                                    className="mt-6"
                                    items={[
                                        "Membership access inside the app.",
                                        "Relevant benefits and services as they become available.",
                                        "A direct route into the wider RAVU ecosystem.",
                                        "Clear guidance at each step of the journey.",
                                    ]}
                                />
                            </div>
                        </Reveal>
                    </div>
                </Container>
            </section>

            {/* -------------------------------------------------- RIDER JOURNEY */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Your journey"
                            title="Join. Connect. Participate. Grow."
                            align="center"
                        />
                    </Reveal>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {RIDER_JOURNEY.map((step, index) => (
                            <Reveal key={step.title} delay={index * 0.06}>
                                <StepCard index={index} title={step.title}>
                                    {step.text}
                                </StepCard>
                            </Reveal>
                        ))}
                    </div>
                </Container>
            </section>

            <AppPromo />

            <CTASection
                eyebrow="Next step"
                title="Ready when you are."
                text="Download the RAVU app when it is available, or learn more about what membership means."
                primary={{ label: "Get the RAVU App", href: "/for-riders#app" }}
                secondary={{ label: "Explore Membership", href: "/membership" }}
            />
        </WebsiteLayout>
    );
}
