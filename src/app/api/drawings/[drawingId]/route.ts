import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// GET /api/drawings/:drawingId — get drawing data
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ drawingId: string }> }
) {
  const { drawingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drawing = await prisma.drawing.findUnique({
    where: { id: drawingId },
  });

  if (!drawing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(drawing);
}

// PUT /api/drawings/:drawingId — save drawing data
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ drawingId: string }> }
) {
  const { drawingId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tldrawDocument } = await request.json();

  const drawing = await prisma.drawing.update({
    where: { id: drawingId },
    data: { tldrawDocument },
  });

  return NextResponse.json(drawing);
}
