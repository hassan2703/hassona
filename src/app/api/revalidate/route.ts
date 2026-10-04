import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Called by a Sanity webhook whenever content is published, so the live site
 * updates within seconds instead of waiting for the hourly refresh.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  try {
    const { isValidSignature } = await parseBody(req, secret);
    if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
