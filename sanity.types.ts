/**
 * ---------------------------------------------------------------------------------
 * SANITY TYPE DEFINITIONS
 * File ini berisi tipe-tipe dasar Sanity yang dibuat manual karena
 * package `sanity-codegen` sudah deprecated. Tipe ini kompatibel dengan Sanity v3.
 * ---------------------------------------------------------------------------------
 */

// === Base Document Types ===

export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface SanityReference<T = unknown> {
  _type: "reference";
  _ref: string;
  _weak?: boolean;
  _dataset?: string;
  _projectId?: string;
}

export interface SanityKeyedReference<T = unknown> extends SanityReference<T> {
  _key: string;
}

export interface SanityKeyed<T> extends Record<string, unknown> {
  _key: string;
  _type?: string;
}

// === Asset Types ===

export interface SanityAsset {
  _type: "reference";
  _ref: string;
  url?: string;
}

export interface SanityImageAsset extends SanityDocument {
  _type: "sanity.imageAsset";
  url: string;
  path: string;
  assetId: string;
  extension: string;
  mimeType: string;
  size: number;
  metadata?: SanityImageMetadata;
}

export interface SanityImageMetadata {
  _type: "sanity.imageMetadata";
  dimensions?: SanityImageDimensions;
  palette?: SanityImagePalette;
  lqip?: string;
  blurHash?: string;
  isOpaque?: boolean;
}

export interface SanityImageDimensions {
  _type: "sanity.imageDimensions";
  height: number;
  width: number;
  aspectRatio: number;
}

export interface SanityImagePalette {
  _type: "sanity.imagePalette";
  darkMuted?: SanityImagePaletteSwatch;
  darkVibrant?: SanityImagePaletteSwatch;
  dominant?: SanityImagePaletteSwatch;
  lightMuted?: SanityImagePaletteSwatch;
  lightVibrant?: SanityImagePaletteSwatch;
  muted?: SanityImagePaletteSwatch;
  vibrant?: SanityImagePaletteSwatch;
}

export interface SanityImagePaletteSwatch {
  _type: "sanity.imagePaletteSwatch";
  background: string;
  foreground: string;
  population: number;
  title?: string;
}

// === Image/File Types ===

export interface SanityImageCrop {
  _type: "sanity.imageCrop";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface SanityImageHotspot {
  _type: "sanity.imageHotspot";
  x?: number;
  y?: number;
  height?: number;
  width?: number;
}

export interface SanityImage {
  _type: "image";
  asset?: SanityReference<SanityImageAsset>;
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;
}

export interface SanityFile {
  _type: "file";
  asset?: SanityAsset;
}

// === Geo & Block Types ===

export interface SanityGeoPoint {
  _type: "geopoint";
  lat?: number;
  lng?: number;
  alt?: number;
}

export interface SanityBlock {
  _type: "block";
  _key: string;
  style?: string;
  listItem?: string;
  children?: Array<{
    _type: "span";
    _key: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
}

// ============================================================
// SCHEMA TYPES — Generated from Sanity Studio schema
// ============================================================

/**
 * Testimonial
 */
export interface Testimonial extends SanityDocument {
  _type: "testimonial";

  /** Name — `string` */
  name?: string;

  /** Role — `string` */
  role?: string;

  /** Content — `text` */
  content?: string;

  /** Avatar — `image` */
  avatar?: {
    _type: "image";
    asset: SanityReference<SanityImageAsset>;
    crop?: SanityImageCrop;
    hotspot?: SanityImageHotspot;
  };
}

/**
 * FAQ Item
 */
export interface FaqItem extends SanityDocument {
  _type: "faqItem";

  /** Question — `string` */
  question?: string;

  /** Answer — `text` */
  answer?: string;
}

export type Documents = Testimonial | FaqItem;