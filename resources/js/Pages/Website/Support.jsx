import { MessageSquare } from "lucide-react";
import WebsiteLayout from "../../Components/WebsiteLayout";
import { CTASection, FAQAccordion, Hero } from "../../Components/sections";
import {
    Button,
    Container,
    Eyebrow,
    Reveal,
    SectionTitle,
} from "../../Components/ui";
import supportImage from "../../../imgs/support.png";

const FAQ = [
    {
        question: "What is RAVU?",
        answer: "RAVU is a membership-based mobility ecosystem connecting people, services and opportunity. It is built around the communities who keep movement happening, and grows outward to include the businesses, services and technology that support them.",
    },
    {
        question: "Who can become a member?",
        answer: "RAVU begins with boda boda riders and motorcycle owners, and is designed to grow with mobility communities more broadly. Membership processes are still being developed, and RAVU will communicate clearly as each stage becomes available.",
    },
    {
        question: "How do I register?",
        answer: "Use the registration page to share your interest. This does not yet create a full operational membership — it records your interest so RAVU can keep you informed as the membership journey becomes available. Riders and drivers will join and use RAVU primarily through the mobile app.",
    },
    {
        question: "How can an organisation partner?",
        answer: "Visit the Partners page to see the partnership opportunities, then start a conversation through this Support area. RAVU is looking for organisations that can add genuine value to members.",
    },
    {
        question: "Need more help?",
        answer: "RAVU's approved support contact channel is being finalised. Once it is available it will be published here, so you always reach the right team.",
    },
];

export default function Support() {
    return (
        <WebsiteLayout>
            <Hero
                eyebrow="Support"
                title="We're here to help you understand RAVU."
                text="Find straightforward answers about membership, riders, benefits and partnership."
                primary={{ label: "Register Interest", href: "/register" }}
                secondary={{ label: "Partner With RAVU", href: "/partners" }}
            />

            <section className="py-16 sm:py-20 lg:py-24">
                <Container>
                    <div className="grid items-start gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
                        <div>
                            <Reveal>
                                <SectionTitle
                                    eyebrow="Frequently asked questions"
                                    title="Helpful starting points."
                                />
                            </Reveal>
                            <Reveal delay={0.08} className="mt-9">
                                <FAQAccordion items={FAQ} />
                            </Reveal>

                            <Reveal
                                delay={0.12}
                                className="mt-8 flex gap-3 rounded-lg border-ink-200 bg-ink-50 p-5"
                            >
                                <MessageSquare
                                    size={18}
                                    className="mt-0.5 shrink-0 text-ravu-700"
                                    aria-hidden="true"
                                />
                                <p className="text-sm leading-6 text-ink-600">
                                    Can&rsquo;t find what you need? The RAVU
                                    team is preparing an official support
                                    channel, and it will appear here as soon as
                                    it is confirmed.
                                </p>
                            </Reveal>
                        </div>

                        <div className="space-y-6">
                            <Reveal>
                                <img
                                    src={supportImage}
                                    alt="A RAVU support agent with a headset, ready to help"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full rounded-xl border-ink-200 object-cover"
                                />
                            </Reveal>

                            <Reveal delay={0.08}>
                                <div className="rounded-xl border-ink-200 bg-ink-50 p-7">
                                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-ravu-700">
                                        <MessageSquare
                                            size={21}
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <Eyebrow className="mt-5">
                                        Contact RAVU
                                    </Eyebrow>
                                    <p className="mt-3 text-sm leading-6 text-ink-600">
                                        RAVU&rsquo;s approved support contact
                                        details have not been published yet.
                                        This area is ready to connect to the
                                        official support channel as soon as it
                                        is confirmed — no phone numbers, email
                                        addresses or messaging links are shown
                                        here until they are real.
                                    </p>
                                    <div className="mt-6">
                                        <Button
                                            href="/partners"
                                            variant="outline"
                                        >
                                            Explore Partnership
                                        </Button>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </Container>
            </section>

            <CTASection
                eyebrow="Still deciding?"
                title="See how RAVU fits together."
                text="Understand the ecosystem, the membership journey and where you fit."
                primary={{ label: "How It Works", href: "/how-it-works" }}
                secondary={{ label: "Explore Membership", href: "/membership" }}
            />
        </WebsiteLayout>
    );
}
