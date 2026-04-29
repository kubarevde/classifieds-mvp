/**
 * Загрузка медиа (обложка объявления, фото в чате).
 * Сейчас во фронте преобладают data URL / локальные файлы — контракт под готовый S3-compatible flow.
 */

export interface CreateUploadSessionRequest {
  /** MIME, например image/jpeg */
  contentType: string;
  byteSize: number;
  /** Назначение: listing_cover, listing_gallery, message_attachment, … */
  purpose: "listing_cover" | "listing_gallery" | "message_attachment" | "avatar";
  /** Опционально привязать к сущности до финализации */
  listingId?: string;
  conversationId?: string;
}

export interface CreateUploadSessionResponse {
  uploadId: string;
  /** URL для прямой загрузки (PUT) */
  uploadUrl: string;
  /** Поля для multipart, если backend так отдаёт */
  headers?: Record<string, string>;
  expiresAtIso: string;
}

export interface CompleteUploadRequest {
  uploadId: string;
  /** Публичный или app-internal URL после обработки на backend */
  publicUrl: string;
  width?: number;
  height?: number;
}

export interface CompleteUploadResponse {
  assetId: string;
  publicUrl: string;
}

export interface DeleteUploadRequest {
  assetId: string;
}

export type DeleteUploadResponse = void;
