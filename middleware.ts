import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 不做任何 redirect，讓 World App 在 app 內自己處理 auth
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};