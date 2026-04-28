import { auth } from '@/auth';

export class UnauthorizedError extends Error {
  constructor(message = '請先登入後再操作。') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function getRequestUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
