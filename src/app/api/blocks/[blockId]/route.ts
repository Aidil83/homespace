import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/blocks/:blockId — delete a block (and its drawing if any)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.block.delete({
    where: { id: blockId },
  });

  return NextResponse.json({ success: true });
}
