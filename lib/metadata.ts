import type { Metadata } from "next";

import { APP_DESCRIPTION, APP_NAME, BASE_URL } from "@/constants/platform";

export function buildMetadata(
  title: string,
  description = APP_DESCRIPTION,
  path = "/"
): Metadata {
  const fullTitle = `${title} | ${APP_NAME}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: APP_NAME,
      locale: "en_ZA",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description
    }
  };
}
