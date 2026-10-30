import React from "react";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://www.matohtechnologies.com/#organization",
    name: "PT. Matoh Technologies Indonesia",
    alternateName: ["Matoh Technologies", "Matoh Tech", "BARQNET"],
    legalName: "PT. Matoh Technologies Indonesia",
    description:
      "Platform pelatihan dan pembelajaran digital terapan resmi bagi pelaku usaha UMKM, akademisi, dan peneliti. Terdaftar resmi di Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia.",
    identifier: "AHU-064920.AH.01.30.Tahun 2024",
    url: "https://www.matohtechnologies.com",
    logo: "https://www.matohtechnologies.com/images/matoh-logo-v2.png",
    image: "https://www.matohtechnologies.com/images/matoh-logo-v2.png",
    slogan: "Make You Ready Digital",
    foundingDate: "2000",
    email: "info@matohtechnologies.com",
    telephone: "+62-812-1010-6680",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Jl. RAMUSEL I/7A (Rawamangun Muka Selatan), Rawamangun, Pulo Gadung",
      addressLocality: "Jakarta Timur",
      addressRegion: "DKI Jakarta",
      postalCode: "13220",
      addressCountry: "ID",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+62-812-1010-6680",
        contactType: "admissions",
        areaServed: "ID",
        availableLanguage: ["Indonesian", "English"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+62-812-1414-0084",
        contactType: "research consultation",
        areaServed: "ID",
        availableLanguage: ["Indonesian", "English"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+62-21-4786-6642",
        contactType: "customer service",
        areaServed: "ID",
        availableLanguage: ["Indonesian", "English"],
      },
    ],
    sameAs: [
      "https://wa.me/6281210106680",
      "https://wa.me/6281214140084",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
