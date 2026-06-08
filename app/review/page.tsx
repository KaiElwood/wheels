import { ReviewPage } from "@/components/review/ReviewPage";
import { API } from "@/server/api";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSearchHref(params: SearchParams) {
  const query = new URLSearchParams();
  const start = getParam(params, "start");
  const end = getParam(params, "end");
  const pickup = getParam(params, "pickup") ?? start;
  const dropoff = getParam(params, "dropoff") ?? end;

  [
    ["pickup", pickup],
    ["dropoff", dropoff],
    ["passengers", getParam(params, "passengers")],
    ["class", getParam(params, "class")],
    ["price", getParam(params, "price")],
  ].forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.size > 0 ? `/?${query.toString()}` : "/";
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
  const searchHref = getSearchHref(params);

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

  return (
    <ReviewPage
      searchHref={searchHref}
      vehicle={vehicle}
      start={start}
      end={end}
      quote={quote}
    />
  );
}
