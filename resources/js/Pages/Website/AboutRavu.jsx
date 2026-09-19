import {
    Building2,
    Globe2,
    HeartHandshake,
    Lightbulb,
    Share2,
    ShieldCheck,
    Target,
    UsersRound,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import { CTASection, EcosystemSection, Hero } from "../../Components/sections";
import {
    Card,
    CardGrid,
    CheckList,
    Container,
    Reveal,
    SectionTitle,
} from "../../Components/ui";
import riderImage from "../../../imgs/rider.png";

const VALUES = [
    {
        icon: ShieldCheck,
        title: "Trust",
        text: "Clear, responsible relationships at every point in the ecosystem.",
    },
    {
        icon: UsersRound,
        title: "Community",
        text: "Mobility is people first, and progress works better together.",
    },
    {
        icon: Share2,
        title: "Inclusion",
        text: "A platform designed to grow with the people who keep movement happening.",
    },
];

export default function AboutRavu() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="About RAVU"
                title="Mobility works better when its people are connected."
                text="RAVU is building a membership-based mobility ecosystem around the riders, drivers, owners, partners and communities who keep movement happening."
                primary={{ label: "Partner With RAVU", href: "/partners" }}
                secondary={{ label: "Explore Membership", href: "/membership" }}
                media={riderImage}
                mediaAlt="RAVU rider in branded kit on a RAVU motorcycle"
                layout="split"
            />

            {/* ------------------------------------------------------- PURPOSE */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Our purpose"
                            title="Opportunity and support, closer to the road."
                            text="RAVU is designed to bring connected services, trusted relationships and practical progress to the mobility economy starting with the people at its centre."
                        />
                    </Reveal>

                    <CardGrid className="mt-12">
                        <Reveal>
                            <Card icon={Globe2} title="Our Vision">
                                A stronger, more connected mobility ecosystem
                                where people can participate and grow.
                            </Card>
                        </Reveal>
                        <Reveal delay={0.08}>
                            <Card icon={Target} title="Our Mission">
                                Connect mobility communities with relevant
                                support, services and opportunity.
                            </Card>
                        </Reveal>
                        <Reveal delay={0.16}>
                            <Card icon={Lightbulb} title="Our Approach">
                                Start with real mobility needs and build trusted
                                ecosystem connections around them.
                            </Card>
                        </Reveal>
                    </CardGrid>
                </Container>
            </section>

            {/* ------------------------------------------------------ WHAT WE ARE */}
            <section className="border-y border-ink-200 bg-ink-50 py-16 sm:py-20 lg:py-24">
                <Container>
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <Reveal>
                            <SectionTitle
                                eyebrow="Who RAVU is"
                                title="A mobility ecosystem, not just an app."
                                text="RAVU exists to make mobility work better for everyone involved in it the people who move, the businesses they move between and the services that support them."
                            />
                        </Reveal>
                        <Reveal delay={0.08}>
                            <CheckList
                                items={[
                                    "A membership ecosystem connecting people, businesses, services and technology.",
                                    "Built around real mobility needs, not abstract technology.",
                                    "Designed to grow with the communities it serves.",
                                    "Open to partners who can add genuine value to members.",
                                ]}
                            />
                        </Reveal>
                    </div>
                </Container>
            </section>

            {/* -------------------------------------------------------- VALUES */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Our values"
                            title="How we show up."
                            align="center"
                        />
                    </Reveal>

                    <CardGrid className="mt-12">
                        {VALUES.map((value, index) => (
                            <Reveal key={value.title} delay={index * 0.08}>
                                <Card
                                    icon={value.icon}
                                    title={value.title}
                                    className="text-center sm:text-center"
                                >
                                    {value.text}
                                </Card>
                            </Reveal>
                        ))}
                    </CardGrid>
                </Container>
            </section>

            {/* ---------------------------------------------------- ECOSYSTEM */}
            <EcosystemSection tone="dark" />

            <CTASection
                eyebrow="Work with RAVU"
                title="Be part of what RAVU is building."
                text="Whether you run a business, serve a community or move people every day, there is a place for you in the RAVU ecosystem."
                primary={{ label: "Partner With RAVU", href: "/partners" }}
                secondary={{ label: "Get the RAVU App", href: "/for-riders" }}
            />
        </WebsiteLayout>
    );
}
