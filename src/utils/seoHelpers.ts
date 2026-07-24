/**
 * Helper utilitas untuk menghasilkan skema data terstruktur (JSON-LD) berstandar Schema.org
 */

export interface NewsArticleParams {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
}

export function createNewsArticleSchema(params: NewsArticleParams) {
  const {
    title,
    description,
    image = "https://www.ibraglobalenglish.uk/assets/logo.png",
    datePublished = new Date().toISOString(),
    dateModified = new Date().toISOString(),
    authorName = "Ibra Global English Editorial Team",
    url = "https://www.ibraglobalenglish.uk/",
  } = params;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": description,
    "image": [image],
    "datePublished": datePublished,
    "dateModified": dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
    "author": {
      "@type": "Organization",
      "name": authorName,
      "url": "https://www.ibraglobalenglish.uk/",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ibra Global English Bobong",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ibraglobalenglish.uk/assets/logo.png",
      },
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}
