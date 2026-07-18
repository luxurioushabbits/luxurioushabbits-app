import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
  // Article-specific
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[];
  // Extra JSON-LD (pass pre-built schema objects)
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = "Luxurious Habbits";
const BASE_URL = "https://www.luxurioushabbits.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const TWITTER_HANDLE = "@LuxuriousHabbits";

export default function SEO({
  title,
  description = "Luxurious Habbits — premium Farm Bill compliant THCA flower and hemp extracts. Indica, Sativa & Hybrid strains. Third-party lab tested, COA verified, discreet shipping.",
  keywords = "THCA flower, premium hemp flower, buy THCA flower online, indica sativa hybrid, farm bill compliant hemp, lab tested hemp flower, hemp extracts, luxury hemp brand",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  datePublished,
  dateModified,
  authorName,
  breadcrumbs,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium THCA Flower & Hemp Extracts`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const ogImageFull = ogImage?.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  // Build breadcrumb JSON-LD if provided
  const breadcrumbJsonLd = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": item.name,
          "item": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
        })),
      }
    : null;

  // Article JSON-LD
  const articleJsonLd = ogType === "article" && datePublished
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": fullTitle,
        "description": description,
        "image": ogImageFull,
        "datePublished": datePublished,
        "dateModified": dateModified ?? datePublished,
        "author": {
          "@type": "Person",
          "name": authorName ?? "Luxurious Habbits Editorial",
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": BASE_URL,
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageFull} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {datePublished && <meta property="article:published_time" content={datePublished} />}
      {dateModified && <meta property="article:modified_time" content={dateModified} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageFull} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Breadcrumb JSON-LD */}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      )}

      {/* Article JSON-LD */}
      {articleJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
      )}

      {/* Extra JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
