import { prisma } from './db';
import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';
import type { Tool } from '@prisma/client';

export type ToolInput = Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>;

export async function getTools(): Promise<Tool[]> {
  return unstable_cache(
    async () => {
      return await prisma.tool.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    ['db_tools_list'],
    { tags: ['tools'] }
  )();
}

export async function getToolById(id: string): Promise<Tool | null> {
  return unstable_cache(
    async () => {
      return await prisma.tool.findUnique({
        where: { id }
      });
    },
    ['db_tool', id],
    { tags: [`tool_${id}`, 'tools'] }
  )();
}

export async function createTool(data: ToolInput): Promise<Tool> {
  const tool = await prisma.tool.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status
    }
  });
  revalidateTag('tools', 'max');
  return tool;
}

export async function updateTool(id: string, data: Partial<ToolInput>): Promise<Tool> {
  const tool = await prisma.tool.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status
    }
  });
  revalidateTag('tools', 'max');
  revalidateTag(`tool_${id}`, 'max');
  return tool;
}

export async function deleteTool(id: string): Promise<void> {
  await prisma.tool.delete({
    where: { id }
  });
  revalidateTag('tools', 'max');
  revalidateTag(`tool_${id}`, 'max');
}
