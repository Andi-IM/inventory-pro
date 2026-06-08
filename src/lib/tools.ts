import { query } from './db';

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  status: string; // 'available', 'in_use', 'maintenance', 'broken'
  created_at: Date;
  updated_at: Date;
}

export type ToolInput = Omit<Tool, 'id' | 'created_at' | 'updated_at'>;

export async function getTools(): Promise<Tool[]> {
  return await query<Tool>('SELECT * FROM public.tools ORDER BY created_at DESC');
}

export async function getToolById(id: string): Promise<Tool | null> {
  const rows = await query<Tool>('SELECT * FROM public.tools WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createTool(data: ToolInput): Promise<Tool> {
  const rows = await query<Tool>(
    `INSERT INTO public.tools (name, description, status) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [data.name, data.description || null, data.status]
  );
  return rows[0];
}

export async function updateTool(id: string, data: Partial<ToolInput>): Promise<Tool> {
  // Build a dynamic update query based on provided fields
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(data.description);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    const existing = await getToolById(id);
    if (!existing) throw new Error('Tool not found');
    return existing;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const queryText = `
    UPDATE public.tools 
    SET ${fields.join(', ')} 
    WHERE id = $${index} 
    RETURNING *
  `;

  const rows = await query<Tool>(queryText, values);
  if (!rows[0]) throw new Error('Tool not found');
  return rows[0];
}

export async function deleteTool(id: string): Promise<void> {
  await query('DELETE FROM public.tools WHERE id = $1', [id]);
}
