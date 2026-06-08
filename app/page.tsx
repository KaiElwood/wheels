import { SearchPage } from "@/components/search/SearchPage";
import { API } from "@/server/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { vehicles } = await API.searchVehicles();

  return <SearchPage vehicles={vehicles} />;
}
