import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { company, primaryPhone, profileSystems } from "@/data/site";
import { siteUrl } from "@/lib/site-url";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

const title = `${company.fullName} — окна, двери и остекление в Алматы`;
const description = `Изготовление и установка пластиковых и алюминиевых окон, дверей, витражей, остекление балконов в Алматы. Замер, доставка и монтаж бесплатно. Профили ${profileSystems
  .slice(0, 4)
  .map((p) => p.name)
  .join(", ")} и другие.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${company.fullName}`,
  },
  description,
  applicationName: company.fullName,
  keywords: [
    "окна Алматы",
    "пластиковые окна Алматы",
    "остекление балконов Алматы",
    "алюминиевые окна Алматы",
    "витражи Алматы",
    "двери ПВХ Алматы",
    "замер окон бесплатно",
    "MEGAPLAST",
  ],
  authors: [{ name: company.fullName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    url: siteUrl,
    siteName: company.fullName,
    title,
    description,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Фасад с рядом установленных окон — работа MEGAPLAST KZ в Алматы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "Окна и остекление",
};

export const viewport: Viewport = {
  themeColor: "#f7f5f1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/** Только подтверждённые данные из карточки 2ГИС и контактов компании. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${siteUrl}/#business`,
  name: company.fullName,
  alternateName: company.directoryName,
  description:
    "Изготовление и установка окон из ПВХ и алюминия, дверей, витражей, остекление балконов и лоджий в Алматы. Замер, доставка и монтаж бесплатно.",
  url: siteUrl,
  telephone: primaryPhone.tel,
  image: `${siteUrl}/og.jpg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "улица Жанкожа батыра, 23, 1 этаж",
    addressLocality: company.city,
    addressRegion: "Алатауский район, мкр Шанырак-2",
    postalCode: company.postalCode,
    addressCountry: "KZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: company.geo.lat,
    longitude: company.geo.lng,
  },
  areaServed: { "@type": "City", name: "Алматы" },
  sameAs: [company.instagram, company.twoGis],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: company.rating.value,
    ratingCount: company.rating.count,
    bestRating: "5",
  },
  makesOffer: [
    "Пластиковые окна",
    "Алюминиевые оконные системы",
    "Двери",
    "Витражи и панорамное остекление",
    "Остекление и отделка балконов",
    "Москитные сетки",
    "Ремонт и обслуживание окон",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
  paymentAccepted: company.payments.join(", "),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <head>
        {/* Ставим класс .js до первой отрисовки: анимации появления включаются
            только если скрипты работают, иначе контент виден сразу. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          // Данные формируются на сервере из статического объекта, не из ввода пользователя
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
