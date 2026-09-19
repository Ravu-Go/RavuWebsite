import {
    Banknote,
    BadgeCheck,
    Building2,
    Bus,
    Handshake,
    Headphones,
    Landmark,
    ShieldCheck,
    Store,
    TrendingUp,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import {
    AppPromo,
    CTASection,
    EcosystemSection,
} from "../../Components/sections";
import {
    Button,
    ButtonRow,
    Card,
    CardGrid,
    Container,
    Eyebrow,
    Reveal,
    SectionTitle,
    StepCard,
    TrustPoint,
} from "../../Components/ui";
import riderImage from "../../../imgs/rider.png";

const PARTNER_TYPES = [
    {
        icon: Building2,
        title: "Hotels & Hospitality",
        text: "Reach RAVU members and mobility customers.",
    },
    {
        icon: ShieldCheck,
        title: "Insurance",
        text: "Develop relevant protection solutions for mobility users.",
    },
    {
        icon: Landmark,
        title: "Banks & Financial Institutions",
        text: "Reach an active mobility community.",
    },
    {
        icon: Wrench,
        title: "Workshops & Spare Parts",
        text: "Become part of the RAVU service network.",
    },
    {
        icon: Store,
        title: "Businesses",
        text: "Offer products, services and exclusive benefits to RAVU members.",
    },
    {
        icon: Handshake,
        title: "Technology Partners",
        text: "Build connected mobility solutions with RAVU.",
    },
];

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
        title: "Access the ecosystem",
        text: "Explore relevant benefits, partners and support.",
    },
    {
        title: "Grow with RAVU",
        text: "Move forward with a stronger mobility journey.",
    },
];

export default function Home() {
    return (
        <WebsiteLayout>
            {/* ---------------------------------------------------------- HERO */}
            <section className="relative overflow-hidden border-b border-ink-200">
                <div className="grid lg:min-h-[36rem] lg:grid-cols-[1.02fr_0.98fr]">
                    <div className="relative flex items-center bg-white">
                        <div
                            aria-hidden="true"
                            className="ravu-mesh pointer-events-none absolute inset-0"
                        />
                        <div
                            aria-hidden="true"
                            className="ravu-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
                        />
                        <div className="relative w-full px-5 py-14 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
                            <div className="ravu-reveal">
                                <Eyebrow>Mobility, connected</Eyebrow>
                                <h1 className="mt-4 text-[2.4rem] font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                                    One Membership.
                                    <br />
                                    More Benefits.
                                    <br />
                                    <span className="text-ravu-600">
                                        More Opportunities.
                                    </span>
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-ink-600 sm:text-lg sm:leading-8">
                                    RAVU is building a stronger mobility
                                    ecosystem connecting the people,
                                    businesses, services and technology that
                                    keep communities moving.
                                </p>
                                <ButtonRow className="mt-8">
                                    <Button href="/partners" size="lg">
                                        Partner With RAVU
                                    </Button>
                                    <Button
                                        href="/for-riders"
                                        size="lg"
                                        variant="outline"
                                    >
                                        Get the RAVU App
                                    </Button>
                                </ButtonRow>
                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-ink-400">
                                    Join. Save. Earn.
                                </p>
                            </div>

                            <div className="ravu-reveal ravu-reveal-delay-3 mt-12 grid gap-6 border-t border-ink-200 pt-8 sm:grid-cols-3">
                                <TrustPoint icon={ShieldCheck} title="Trusted">
                                    A community built around mobility.
                                </TrustPoint>
                                <TrustPoint
                                    icon={BadgeCheck}
                                    title="Member value"
                                >
                                    Relevant benefits and offers.
                                </TrustPoint>
                                <TrustPoint icon={Headphones} title="Support">
                                    Guidance when you need it.
                                </TrustPoint>
                            </div>
                        </div>
                    </div>

                    <div className="ravu-reveal ravu-reveal-delay-1 relative min-h-[20rem] overflow-hidden bg-ink-950 sm:min-h-[26rem] lg:min-h-full">
                        <img
                            src={riderImage}
                            alt="RAVU rider in branded kit on a RAVU motorcycle"
                            className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/30 to-transparent lg:w-28"
                        />
                        <div className="absolute bottom-5 right-5 hidden rounded-lg bg-ink-950/85 px-4 py-3 backdrop-blur sm:block">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ravu-400">
                                RAVU
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                                Together we drive better.........................!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------------------- MORE THAN A MEMBERSHIP */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="More than a membership"
                            title="One membership. A whole ecosystem behind it."
                            text="RAVU brings practical services, businesses, partners and community together around the people who keep movement happening."
                        />
                    </Reveal>

                    <CardGrid className="mt-12">
                        <Reveal>
                            <Card icon={TrendingUp} title="Earn More">
                                Access opportunities and ecosystem benefits
                                designed around mobility.
                            </Card>
                        </Reveal>
                        <Reveal delay={0.08}>
                            <Card icon={Banknote} title="Spend Less">
                                Discover relevant service benefits and partner
                                offers.
                            </Card>
                        </Reveal>
                        <Reveal delay={0.16}>
                            <Card icon={Bus} title="Drive Better">
                                Connect with support, training and protection.
                            </Card>
                        </Reveal>
                    </CardGrid>
                </Container>
            </section>

            {/* -------------------------------------------------- ECOSYSTEM */}
            <EcosystemSection />

            {/* ---------------------------------------------------- PARTNERS */}
            <section className="relative overflow-hidden bg-ink-950 py-16 text-ink-300 sm:py-20 lg:py-24">
                <div
                    aria-hidden="true"
                    className="ravu-pattern-dark pointer-events-none absolute inset-0"
                />
                <Container className="relative">
                    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                        <Reveal>
                            <Eyebrow tone="light">Partner with RAVU</Eyebrow>
                            <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-[2.5rem]">
                                Build the mobility ecosystem with RAVU.
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-7 text-ink-300 sm:text-lg">
                                RAVU connects organisations to an active
                                mobility community. Whether you provide
                                protection, finance, services or technology,
                                there is a place for you in the ecosystem.
                            </p>
                            <div className="mt-8">
                                <Button href="/partners" size="lg">
                                    Partner With RAVU
                                </Button>
                            </div>
                        </Reveal>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {PARTNER_TYPES.map((partner, index) => (
                                <Reveal
                                    key={partner.title}
                                    delay={index * 0.05}
                                >
                                    <Card
                                        icon={partner.icon}
                                        title={partner.title}
                                        tone="dark"
                                    >
                                        {partner.text}
                                    </Card>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* ----------------------------------------------------- JOURNEY */}
            <section className="border-y border-ink-200 bg-ink-50 py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="How it works"
                            title="Discover. Join. Connect. Grow."
                            text="A clear route into a connected mobility ecosystem — for members and for organisations."
                            align="center"
                        />
                    </Reveal>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {JOURNEY.map((step, index) => (
                            <Reveal key={step.title} delay={index * 0.06}>
                                <StepCard index={index} title={step.title}>
                                    {step.text}
                                </StepCard>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.1} className="mt-10 text-center">
                        <Button href="/how-it-works" variant="outline">
                            See how it works
                        </Button>
                    </Reveal>
                </Container>
            </section>

            {/* ------------------------------------------------------- APP */}
            <AppPromo />

            {/* ------------------------------------------------------- CTA */}
            <CTASection
                eyebrow="Get involved"
                title="Where do you join RAVU?"
                text="Riders and drivers join through the RAVU app. Organisations partner with RAVU directly. Two journeys, one ecosystem."
                primary={{ label: "Get the RAVU App", href: "/for-riders" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
            />
        </WebsiteLayout>
    );
}
