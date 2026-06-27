"use client";

/**
 * Embedded Sanity Studio Page
 * Renders the Sanity CMS editor interface directly inside the browser at /studio
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
