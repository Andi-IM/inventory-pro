'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createTool, updateTool, deleteTool } from '@/lib/tools';
import { auth } from '@/lib/auth/server';
import { getUserRole } from '@/lib/auth/authorization';

// Helper to assert that the caller is authenticated and authorized
async function assertAuthorized() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const role = await getUserRole(session.user.id);
  // Allow superuser and operator to manage tools
  if (role !== 'superuser' && role !== 'operator') {
    throw new Error('Forbidden: Only operators and superusers can manage tools');
  }
}

export async function createToolAction(formData: FormData) {
  await assertAuthorized();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!name) {
    throw new Error('Name is required');
  }

  await createTool({
    name,
    description: description || null,
    status: status || 'available',
  });

  revalidatePath('/dashboard/tools');
  redirect('/dashboard/tools');
}

export async function updateToolAction(id: string, formData: FormData) {
  await assertAuthorized();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  if (!name) {
    throw new Error('Name is required');
  }

  await updateTool(id, {
    name,
    description: description || null,
    status,
  });

  revalidatePath('/dashboard/tools');
  revalidatePath(`/dashboard/tools/${id}`);
  redirect('/dashboard/tools');
}

export async function deleteToolAction(id: string) {
  await assertAuthorized();
  await deleteTool(id);
  revalidatePath('/dashboard/tools');
  redirect('/dashboard/tools');
}
