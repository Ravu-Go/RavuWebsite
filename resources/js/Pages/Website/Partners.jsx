import {
    Banknote,
    Building2,
    Handshake,
    Landmark,
    Store,
    Wrench,
} from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import CommunitySection from "../../Components/CommunitySection";
import { Hero } from "../../Components/sections";
import {
    Button,
    Card,
    CardGrid,
    Container,
    Eyebrow,
    Reveal,
    SectionTitle,
    StepCard,
} from "../../Components/ui";
import fundRepairShop from "../../../imgs/memberPlusPartners.png";

const OPPORTUNITIES = [
    {
        icon: Store,
        title: "Mobility Businesses",
        text: "Build relevant service connections around members.",
    },
    {
        icon: Banknote,
        title: "Financial Institutions",
        text: "Explore responsible financial ecosystem opportunities.",
    },
    {
        icon: Wrench,
        title: "Service Providers",
        text: "Support practical mobility needs through the network.",
    },
    {
        icon: Building2,
        title: "Community Organisations",
        text: "Help strengthen the communities that keep movement happening.",
    },
    {
        icon: Handshake,
        title: "Technology Partners",
        text: "Contribute to accessible, connected mobility experiences.",
    },
    {
        icon: Landmark,
        title: "Insurance & Protection",
        text: "Develop relevant protection solutions for mobility users.",
    },
];

const PROCESS = [
    {
        title: "Connect",
        text: "Introduce your organisation and the value it can bring.",
    },
    {
        title: "Explore fit",
        text: "Identify relevant opportunities for members and partners.",
    },
    {
        title: "Build together",
        text: "Develop clear, practical ecosystem relationships.",
    },
];

export default function Partners() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="Partners"
                title="Build the mobility ecosystem with RAVU."
                text="RAVU creates space for businesses and service providers to connect with the communities that keep mobility moving."
                primary={{ label: "Contact RAVU", href: "/support" }}
                secondary={{ label: "How Partnership Works", href: "#process" }}
                media={fundRepairShop}
                mediaAlt="A RAVU-branded workshop providing mobility services"
                layout="split"
            />

            {/* -------------------------------------------------- OPPORTUNITIES */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Partnership opportunities"
                            title="Relevant services, closer to members."
                            text="Partnership at RAVU is about adding genuine value to members while reaching an active, engaged mobility community."
                        />
                    </Reveal>

                    <CardGrid className="mt-12">
                        {OPPORTUNITIES.map((item, index) => (
                            <Reveal key={item.title} delay={index * 0.05}>
                                <Card icon={item.icon} title={item.title}>
                                    {item.text}
                                </Card>
                            </Reveal>
                        ))}
                    </CardGrid>
                </Container>
            </section>

            {/* ------------------------------------------- HOW PARTNERSHIP WORKS */}
            <section
                id="process"
                className="border-y border-ink-200 bg-ink-50 py-16 sm:py-20 lg:py-24"
            >
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="How partnership works"
                            title="Start with shared purpose."
                            text="A simple, practical process — no unnecessary complexity."
                            align="center"
                        />
                    </Reveal>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {PROCESS.map((step, index) => (
                            <Reveal key={step.title} delay={index * 0.08}>
                                <StepCard index={index} title={step.title}>
                                    {step.text}
                                </StepCard>
                            </Reveal>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ---------------------------------------------------- WHAT WE LOOK FOR */}
            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <Eyebrow>Contact RAVU</Eyebrow>
                        <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.4rem]">
                            Ready to explore partnership?
                        </h2>
                        <p className="mt-5 text-base leading-7 text-ink-600 sm:text-lg">
                            RAVU&rsquo;s approved partnership contact channel is
                            being finalised. Until it is published here, the
                            Support area is the right place to start the
                            conversation.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Button href="/support" size="lg">
                                Contact RAVU
                            </Button>
                        </div>
                    </Reveal>
                </Container>
            </section>

            <CommunitySection />
        </WebsiteLayout>
    );
}
