import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// GET /api/pages/:pageId — get a single page with its blocks
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

// PATCH /api/pages/:pageId — update a page
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, icon, isArchived, parentId } = body;

  const page = await prisma.page.update({
    where: { id: pageId },
    data: {
      ...(title !== undefined && { title }),
      ...(icon !== undefined && { icon }),
      ...(isArchived !== undefined && { isArchived }),
      ...(parentId !== undefined && { parentId }),
    },
  });

  return NextResponse.json(page);
}

// DELETE /api/pages/:pageId — archive a page (soft delete)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.page.update({
    where: { id: pageId },
    data: { isArchived: true },
  });

  return NextResponse.json({ success: true });
}
