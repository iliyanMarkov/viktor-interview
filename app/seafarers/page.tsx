import { notFound } from "next/navigation";
import { getSeafarer } from "@/lib/seafarers";
import SeafarersList from "./SeafarersList";
import SeafarerProfile from "./SeafarerProfile";

export default async function SeafarersPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const ids = searchParams?.ids;

  if (ids) {
    const id = Array.isArray(ids) ? ids[0] : ids;
    const seafarer = getSeafarer(id);
    if (!seafarer) notFound();
    return <SeafarerProfile seafarer={seafarer} />;
  }

  return <SeafarersList />;
}
