import { NextRequest, NextResponse } from "next/server";
import { validatePassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || !validatePassword(password)) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  await setAuthCookie();

  return NextResponse.json({ success: true });
}
