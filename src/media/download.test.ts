/**
 * Unit tests for media download
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteMedia, downloadMedia, getMediaUrl } from './download.js';
import { HTTPClient } from '../client/http.js';
import type { MediaUrlResponse, MediaDownloadResponse } from '../types/responses.js';

describe('Media Download', () => {
  let mockClient: HTTPClient;
  let mockGet: ReturnType<typeof vi.fn>;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockClient = {
      get: mockGet,
      accessToken: 'test-token',
    } as unknown as HTTPClient;
  });

  describe('getMediaUrl', () => {
    it('should get media URL and metadata', async () => {
      const mockApiResponse = {
        url: 'https://example.com/media/file.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const result = await getMediaUrl(mockClient, 'media123');

      expect(result).toEqual({
        url: 'https://example.com/media/file.jpg',
        mimeType: 'image/jpeg',
        sha256: 'abc123',
        fileSize: 12345,
      });
      expect(mockGet).toHaveBeenCalledWith('media123');
    });

    it('should handle different media types', async () => {
      const mediaTypes = [
        { mime_type: 'image/jpeg', expected: 'image/jpeg' },
        { mime_type: 'video/mp4', expected: 'video/mp4' },
        { mime_type: 'audio/mpeg', expected: 'audio/mpeg' },
        { mime_type: 'application/pdf', expected: 'application/pdf' },
      ];

      for (const { mime_type, expected } of mediaTypes) {
        mockGet.mockResolvedValue({
          url: 'https://example.com/media/file',
          mime_type,
          sha256: 'abc123',
          file_size: 12345,
          id: 'media123',
          messaging_product: 'whatsapp',
        });

        const result = await getMediaUrl(mockClient, 'media123');
        expect(result.mimeType).toBe(expected);
      }
    });
  });

  describe('downloadMedia', () => {
    it('should download media and return buffer', async () => {
      const mockApiResponse = {
        url: 'https://example.com/media/file.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      };

      mockGet.mockResolvedValue(mockApiResponse);

      const fakeFileData = new Uint8Array([1, 2, 3, 4, 5]);
      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => fakeFileData.buffer,
      });

      const result = await downloadMedia(mockClient, 'media123');

      expect(result).toEqual({
        buffer: expect.any(Buffer),
        mimeType: 'image/jpeg',
        sha256: 'abc123',
        fileSize: 12345,
      });

      expect(mockGet).toHaveBeenCalledWith('media123');
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/media/file.jpg', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
    });

    it('should download image media', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/image.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(12345),
      });

      const result = await downloadMedia(mockClient, 'media123');

      expect(result.mimeType).toBe('image/jpeg');
      expect(result.buffer).toBeDefined();
    });

    it('should download video media', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/video.mp4',
        mime_type: 'video/mp4',
        sha256: 'def456',
        file_size: 54321,
        id: 'media456',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(54321),
      });

      const result = await downloadMedia(mockClient, 'media456');

      expect(result.mimeType).toBe('video/mp4');
      expect(result.fileSize).toBe(54321);
    });

    it('should download audio media', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/audio.mp3',
        mime_type: 'audio/mpeg',
        sha256: 'ghi789',
        file_size: 98765,
        id: 'media789',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(98765),
      });

      const result = await downloadMedia(mockClient, 'media789');

      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.sha256).toBe('ghi789');
    });

    it('should download document media', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/document.pdf',
        mime_type: 'application/pdf',
        sha256: 'jkl012',
        file_size: 123456,
        id: 'media012',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(123456),
      });

      const result = await downloadMedia(mockClient, 'media012');

      expect(result.mimeType).toBe('application/pdf');
    });

    it('should throw error on download failure', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/file.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(downloadMedia(mockClient, 'media123')).rejects.toThrow(
        'Media download failed'
      );
    });

    it('should include authorization header in download request', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/file.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(12345),
      });

      await downloadMedia(mockClient, 'media123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle expired media', async () => {
      mockGet.mockResolvedValue({
        url: 'https://example.com/media/expired.jpg',
        mime_type: 'image/jpeg',
        sha256: 'abc123',
        file_size: 12345,
        id: 'media123',
        messaging_product: 'whatsapp',
      });

      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Gone',
      });

      await expect(downloadMedia(mockClient, 'media123')).rejects.toThrow(
        'Media download failed'
      );
    });
  });

  describe('deleteMedia', () => {
    it('should delete media by ID', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ success: true });
      mockClient = {
        delete: mockDelete,
      } as unknown as HTTPClient;

      const result = await deleteMedia(mockClient, 'media123');

      expect(mockDelete).toHaveBeenCalledWith('media123');
      expect(result).toEqual({ success: true });
    });
  });
});
