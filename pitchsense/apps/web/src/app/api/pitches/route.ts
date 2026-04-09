import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    // Forward to the backend API
    const backendFormData = new FormData();
    backendFormData.append("userId", userId);
    backendFormData.append("mode", mode);
    if (file) backendFormData.append("file", file);
    if (text) backendFormData.append("text", text);

    const apiRes = await fetch(`${process.env.API_URL}/pitches`, {
      method: "POST",
      headers: { "x-api-secret": process.env.API_SECRET! },
      body: backendFormData,
    });

    if (!apiRes.ok) {
      const err = await apiRes.json();
      return NextResponse.json({ error: err.message }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/pitches]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiRes = await fetch(`${process.env.API_URL}/pitches?userId=${userId}`, {
    headers: { "x-api-secret": process.env.API_SECRET! },
  });

  const data = await apiRes.json();
  return NextResponse.json(data);
}
