import { headers } from 'next/headers';

export async function getRequestUserId() {
  const headerStore = await headers();
  return headerStore.get('x-demo-user') ?? 'demo-user';
}
