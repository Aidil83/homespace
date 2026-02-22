import { ProblemView } from "@/components/dsa/problem-view";

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProblemView slug={slug} />;
}
