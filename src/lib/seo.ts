import { contact } from "./contact";
import { serviceCities } from "./service-area";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kricksautodetailing.com").replace(/\/$/, "");

export const localSeo = {
  businessName: "Krick's Auto Detailing",
  legalName: "Krick's Auto Detailing",
  city: "Decatur",
  region: "IN",
  postalArea: "Decatur, Indiana",
  country: "US",
  phone: contact.primaryPhone.label,
  phoneHref: "+12608493942",
  secondaryPhone: contact.secondaryPhone.label,
  email: contact.email,
  serviceRadius: "30 minutes from Decatur, Indiana",
  primaryKeywords: [
    "car detailers near Decatur IN",
    "mobile car detailing Decatur IN",
    "auto detailing Decatur Indiana",
    "mobile detailing near Decatur Indiana",
    "truck detailing Decatur IN",
    "interior car detailing Decatur IN",
  ],
  serviceNames: [
    "Mobile auto detailing",
    "Interior detailing",
    "Car detailing",
    "Truck and SUV detailing",
    "Semi cab detailing",
    "Powersport detailing",
    "Trailer detailing",
  ],
};

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serviceAreaText() {
  return serviceCities.map((city) => `${city.name}, ${city.state}`).join(", ");
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoWash"],
    "@id": absoluteUrl("/#localbusiness"),
    name: localSeo.businessName,
    legalName: localSeo.legalName,
    url: siteUrl,
    email: localSeo.email,
    telephone: localSeo.phoneHref,
    priceRange: "$$",
    description:
      "Mobile auto detailing serving Decatur, Indiana and surrounding communities within roughly 30 minutes. Services include car detailing, truck and SUV detailing, semi cab detailing, powersport detailing, trailer detailing, and detailing add-ons.",
    address: {
      "@type": "PostalAddress",
      addressLocality: localSeo.city,
      addressRegion: localSeo.region,
      addressCountry: localSeo.country,
    },
    areaServed: serviceCities.map((city) => ({
      "@type": "City",
      name: `${city.name}, ${city.state}`,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    makesOffer: localSeo.serviceNames.map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
        areaServed: `${localSeo.serviceRadius}`,
      },
    })),
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: localSeo.businessName,
    url: siteUrl,
    publisher: {
      "@id": absoluteUrl("/#localbusiness"),
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Krick's Auto Detailing serve Decatur, Indiana?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Krick's Auto Detailing is based around Decatur, Indiana and provides mobile detailing within roughly a 30-minute service radius.",
        },
      },
      {
        "@type": "Question",
        name: "Can Krick's come to my home or workplace?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Krick's Auto Detailing is a mobile detailing service. Appointments can be requested at homes, workplaces, and other accessible locations in the service area.",
        },
      },
      {
        "@type": "Question",
        name: "What vehicles does Krick's detail?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Services cover cars, trucks, SUVs, semi cabs, powersport vehicles, trailers, haulers, and detailing add-ons.",
        },
      },
    ],
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
