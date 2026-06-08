import { ReviewPage } from "@/components/review/ReviewPage";
import { API } from "@/server/api";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await searchParams;
  const id = getParam(params, "id");
  const start = getParam(params, "start");
  const end = getParam(params, "end");

  if (!id) {
    throw new Error("No reservation ID found");
  }

  const vehicle = await API.getVehicle(id);
  const quote =
    start && end
      ? await API.getQuote({
          vehicleId: id,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
        })
      : undefined;

  return <ReviewPage vehicle={vehicle} start={start} end={end} quote={quote} />;
}
