import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTools, getToolById, createTool, updateTool, deleteTool } from './tools';

// Mock the db module
vi.mock('./db', () => ({
  query: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
}));

// We need to import the mocked query function to set its return values
import { query } from './db';

describe('Tools Data Access Layer', () => {
  const mockTools = [
    {
      id: 'tool-1',
      name: 'Hammer',
      description: 'A standard hammer',
      status: 'available',
      created_at: new Date('2026-06-01T00:00:00Z'),
      updated_at: new Date('2026-06-01T00:00:00Z'),
    },
    {
      id: 'tool-2',
      name: 'Drill',
      description: 'Power drill',
      status: 'in_use',
      created_at: new Date('2026-06-02T00:00:00Z'),
      updated_at: new Date('2026-06-02T00:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTools', () => {
    it('should return a list of tools ordered by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValueOnce(mockTools);

      const result = await getTools();

      expect(query).toHaveBeenCalledWith('SELECT * FROM public.tools ORDER BY created_at DESC');
      expect(result).toEqual(mockTools);
      expect(result).toHaveLength(2);
    });
  });

  describe('getToolById', () => {
    it('should return a tool if found', async () => {
      vi.mocked(query).mockResolvedValueOnce([mockTools[0]]);

      const result = await getToolById('tool-1');

      expect(query).toHaveBeenCalledWith('SELECT * FROM public.tools WHERE id = $1', ['tool-1']);
      expect(result).toEqual(mockTools[0]);
    });

    it('should return null if tool not found', async () => {
      vi.mocked(query).mockResolvedValueOnce([]);

      const result = await getToolById('tool-999');

      expect(query).toHaveBeenCalledWith('SELECT * FROM public.tools WHERE id = $1', ['tool-999']);
      expect(result).toBeNull();
    });
  });

  describe('createTool', () => {
    it('should execute INSERT query and return the new tool', async () => {
      const newTool = { ...mockTools[0], id: 'new-tool-id' };
      vi.mocked(query).mockResolvedValueOnce([newTool]);

      const result = await createTool({
        name: 'Hammer',
        description: 'A standard hammer',
        status: 'available',
      });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO public.tools (name, description, status)'),
        ['Hammer', 'A standard hammer', 'available']
      );
      expect(result).toEqual(newTool);
    });
    
    it('should replace missing description with null', async () => {
      const newTool = { ...mockTools[0], id: 'new-tool-id', description: null };
      vi.mocked(query).mockResolvedValueOnce([newTool]);

      await createTool({
        name: 'Hammer',
        description: null,
        status: 'available',
      });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO public.tools (name, description, status)'),
        ['Hammer', null, 'available']
      );
    });
  });

  describe('updateTool', () => {
    it('should execute dynamic UPDATE query for provided fields', async () => {
      const updatedTool = { ...mockTools[0], status: 'maintenance' };
      vi.mocked(query).mockResolvedValueOnce([updatedTool]);

      const result = await updateTool('tool-1', { status: 'maintenance' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE public.tools'),
        expect.arrayContaining(['maintenance', 'tool-1'])
      );
      expect(result).toEqual(updatedTool);
    });

    it('should return existing tool if no fields provided to update', async () => {
      // Mock getToolById which is called internally when fields is empty
      vi.mocked(query).mockResolvedValueOnce([mockTools[0]]);

      const result = await updateTool('tool-1', {});

      // It should just select the existing tool without updating
      expect(query).toHaveBeenCalledWith('SELECT * FROM public.tools WHERE id = $1', ['tool-1']);
      expect(result).toEqual(mockTools[0]);
    });

    it('should throw Error if tool not found during update', async () => {
      vi.mocked(query).mockResolvedValueOnce([]);

      await expect(updateTool('tool-999', { name: 'New Name' })).rejects.toThrow('Tool not found');
    });
  });

  describe('deleteTool', () => {
    it('should execute DELETE query', async () => {
      vi.mocked(query).mockResolvedValueOnce([]);

      await deleteTool('tool-1');

      expect(query).toHaveBeenCalledWith('DELETE FROM public.tools WHERE id = $1', ['tool-1']);
    });
  });
});
