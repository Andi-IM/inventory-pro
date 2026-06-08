import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTools, getToolById, createTool, updateTool, deleteTool } from './tools';
import { prisma } from './db';

// Mock the db module
vi.mock('./db', () => ({
  prisma: {
    tool: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
}));

describe('Tools Data Access Layer', () => {
  const mockTools = [
    {
      id: 'tool-1',
      name: 'Hammer',
      description: 'A standard hammer',
      status: 'available',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    },
    {
      id: 'tool-2',
      name: 'Drill',
      description: 'Power drill',
      status: 'in_use',
      createdAt: new Date('2026-06-02T00:00:00Z'),
      updatedAt: new Date('2026-06-02T00:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTools', () => {
    it('should return a list of tools ordered by createdAt DESC', async () => {
      vi.mocked(prisma.tool.findMany).mockResolvedValueOnce(mockTools);

      const result = await getTools();

      expect(prisma.tool.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockTools);
      expect(result).toHaveLength(2);
    });
  });

  describe('getToolById', () => {
    it('should return a tool if found', async () => {
      vi.mocked(prisma.tool.findUnique).mockResolvedValueOnce(mockTools[0]);

      const result = await getToolById('tool-1');

      expect(prisma.tool.findUnique).toHaveBeenCalledWith({
        where: { id: 'tool-1' }
      });
      expect(result).toEqual(mockTools[0]);
    });

    it('should return null if tool not found', async () => {
      vi.mocked(prisma.tool.findUnique).mockResolvedValueOnce(null);

      const result = await getToolById('tool-999');

      expect(prisma.tool.findUnique).toHaveBeenCalledWith({
        where: { id: 'tool-999' }
      });
      expect(result).toBeNull();
    });
  });

  describe('createTool', () => {
    it('should execute create and return the new tool', async () => {
      const newTool = { ...mockTools[0], id: 'new-tool-id' };
      vi.mocked(prisma.tool.create).mockResolvedValueOnce(newTool);

      const result = await createTool({
        name: 'Hammer',
        description: 'A standard hammer',
        status: 'available',
      });

      expect(prisma.tool.create).toHaveBeenCalledWith({
        data: {
          name: 'Hammer',
          description: 'A standard hammer',
          status: 'available',
        }
      });
      expect(result).toEqual(newTool);
    });
  });

  describe('updateTool', () => {
    it('should execute update with provided fields', async () => {
      const updatedTool = { ...mockTools[0], status: 'maintenance' };
      vi.mocked(prisma.tool.update).mockResolvedValueOnce(updatedTool);

      const result = await updateTool('tool-1', { status: 'maintenance' });

      expect(prisma.tool.update).toHaveBeenCalledWith({
        where: { id: 'tool-1' },
        data: {
          name: undefined,
          description: undefined,
          status: 'maintenance',
        }
      });
      expect(result).toEqual(updatedTool);
    });
  });

  describe('deleteTool', () => {
    it('should execute delete', async () => {
      vi.mocked(prisma.tool.delete).mockResolvedValueOnce(mockTools[0]);

      await deleteTool('tool-1');

      expect(prisma.tool.delete).toHaveBeenCalledWith({
        where: { id: 'tool-1' }
      });
    });
  });
});
