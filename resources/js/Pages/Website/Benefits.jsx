import { Banknote, HeartHandshake, ShieldCheck, Wrench } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import { CTASection, Hero } from "../../Components/sections";
import {
    Card,
    CardGrid,
    Container,
    Reveal,
    SectionTitle,
} from "../../Components/ui";

const BENEFIT_AREAS = [
    {
        icon: Banknote,
        title: "Savings & Financial Access",
        text: "Relevant opportunities and services as the ecosystem develops.",
    },
    {
        icon: ShieldCheck,
        title: "Protection & Support",
        text: "Access to a broader support system around mobility.",
    },
    {
        icon: Wrench,
        title: "Maintenance & Operations",
        text: "Connections to practical services that help members operate better.",
    },
    {
        icon: HeartHandshake,
        title: "Community & Rewards",
        text: "A membership community built around participation and progress.",
    },
];

export default function Benefits() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="Benefits"
                title="More support around every mobility journey."
                text="RAVU is designed to connect members to benefits that help them operate, participate and grow."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Get the RAVU App", href: "/for-riders" }}
            />

            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <Reveal>
                        <SectionTitle
                            eyebrow="Member value"
                            title="Benefits that work together."
                            text="Each part of the RAVU ecosystem supports the others. As the network grows, the support available to members grows with it."
                        />
                    </Reveal>

                    <CardGrid className="mt-12" columns={2}>
                        {BENEFIT_AREAS.map((area, index) => (
                            <Reveal key={area.title} delay={index * 0.07}>
                                <Card icon={area.icon} title={area.title}>
                                    {area.text}
                                </Card>
                            </Reveal>
                        ))}
                    </CardGrid>
                </Container>
            </section>

            <CTASection
                eyebrow="Start here"
                title="Membership is the way in."
                text="Benefits are accessed through RAVU membership as services become available."
                primary={{ label: "Explore Membership", href: "/membership" }}
                secondary={{ label: "Get the RAVU App", href: "/for-riders" }}
            />
        </WebsiteLayout>
    );
}
