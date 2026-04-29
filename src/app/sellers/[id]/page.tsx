import { permanentRedirect } from "next/navigation";

type SellerStorefrontPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerStorefrontPage({ params }: SellerStorefrontPageProps) {
  const { id } = await params;
  permanentRedirect(`/stores/${id}`);
}
