export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "2:3", "21:9"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const IMAGE_SIZES = ["auto", "1k", "2k"] as const;
export type ImageSize = (typeof IMAGE_SIZES)[number];

export interface GeneratedImage {
  mime_type: string;
  data_base64: string;
  text?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: AspectRatio;
  image_size?: ImageSize;
  num_images?: number;
  include_caption?: boolean;
}

export interface GenerateImageResponse {
  images: GeneratedImage[];
  model: string;
  request_id: string;
  warnings: string[];
}

export interface EnhancePromptResponse {
  enhanced_prompt: string;
  model: string;
  request_id: string;
}

export interface AppConfig {
  aspect_ratios: readonly string[];
  image_sizes: readonly string[];
  max_num_images: number;
  models: { image: string; enhance: string };
  unsupported: {
    negative_prompt: string;
    seed: string;
    candidate_count: string;
  };
}

export interface GalleryItem {
  id: string;
  image: GeneratedImage;
  prompt: string;
  timestamp: Date;
}

export type ApiError = {
  code: string;
  message: string;
  request_id?: string;
};
