import {
    Award,
    BadgeCheck,
    Banknote,
    Briefcase,
    Building2,
    Car,
    Compass,
    CreditCard,
    FileCheck2,
    Fuel,
    Globe2,
    Handshake,
    HeartHandshake,
    HeartPulse,
    Landmark,
    Layers,
    Lightbulb,
    MapPin,
    Percent,
    Share2,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    Target,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Wrench,
    Zap,
} from "lucide-react";

/**
 * Icons the content editor may assign to cards. Content stores the name;
 * pages render the matching component. Add a lucide icon here to offer it.
 */
export const CONTENT_ICONS = {
    Award,
    BadgeCheck,
    Banknote,
    Briefcase,
    Building2,
    Car,
    Compass,
    CreditCard,
    FileCheck2,
    Fuel,
    Globe2,
    Handshake,
    HeartHandshake,
    HeartPulse,
    Landmark,
    Layers,
    Lightbulb,
    MapPin,
    Percent,
    Share2,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    Target,
    TrendingUp,
    Truck,
    Users,
    UsersRound,
    Wrench,
    Zap,
};

export const ICON_NAMES = Object.keys(CONTENT_ICONS);

export function iconFor(name) {
    return CONTENT_ICONS[name] || Sparkles;
}
