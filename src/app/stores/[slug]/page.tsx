import { redirect } from "next/navigation";

type StoreAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreAliasPage({ params }: StoreAliasPageProps) {
  const { slug } = await params;
  redirect(`/sellers/${slug}`);
}
