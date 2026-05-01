import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler, ChartData, ChartOptions, type TooltipItem, } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);
type TimeRange = "week" | "month" | "year";
interface VisitAnalytics {
    totalVisits: number;
    uniqueVisitors: number;
    visitorsByLocation?: Record<string, number> | null;
    visitTimeSeries?: {
        labels: string[];
        counts: number[];
        range: string;
    };
    firstVisitAt?: string | null;
    topReferrers?: {
        source: string;
        count: number;
        share: number;
    }[];
}
function MetricCard({ title, value, hint, icon, }: {
    title: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
}) {
    return (<div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mr-4 text-accent">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
      {hint ? <p className="text-sm text-gray-500">{hint}</p> : null}
    </div>);
}
export function AnalyticsCharts() {
    const [timeRange, setTimeRange] = useState<TimeRange>("month");
    const { data: analyticsData, isLoading } = useQuery<VisitAnalytics>({
        queryKey: [`/api/analytics/stats?range=${timeRange}`],
    });
    const visitTimeSeries = analyticsData?.visitTimeSeries;
    const labels = visitTimeSeries?.labels ?? [];
    const counts = visitTimeSeries?.counts ?? [];
    const visitorsChartData: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: "Visits",
                data: counts,
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                tension: 0.3,
                fill: true,
            },
        ],
    };
    const lineChartOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items) => items[0]?.label ?? "",
                    label: (item) => ` ${item.parsed.y ?? 0} visits`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 },
                grid: { color: "rgba(0, 0, 0, 0.05)" },
            },
            x: {
                grid: { display: false },
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: timeRange === "month" ? 10 : 12,
                },
            },
        },
    };
    const traffic = analyticsData?.visitorsByLocation ?? {};
    const trafficEntries = Object.entries(traffic).filter(([, n]) => n > 0);
    const locationChartData = {
        labels: trafficEntries.map(([k]) => k),
        datasets: [
            {
                data: trafficEntries.map(([, v]) => v),
                backgroundColor: ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#94a3b8", "#64748b", "#0ea5e9"],
                borderWidth: 0,
            },
        ],
    };
    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right" as const,
            },
            tooltip: {
                callbacks: {
                    label: (ctx: TooltipItem<"doughnut">) => {
                        const raw = ctx.dataset.data as number[];
                        const total = raw.reduce((a, b) => a + b, 0);
                        const v = typeof ctx.parsed === "number" ? ctx.parsed : 0;
                        const pct = total ? Math.round((v / total) * 100) : 0;
                        return ` ${ctx.label}: ${v} (${pct}%)`;
                    },
                },
            },
        },
        cutout: "70%",
    };
    const trackingHint = !analyticsData?.firstVisitAt
        ? "Open the site once to record the first timestamp"
        : "In-memory on this server; counts reset when the process restarts";
    const topReferrers = analyticsData?.topReferrers ?? [];
    return (<section id="analytics" className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-accent-100 text-accent px-4 py-2 rounded-full text-sm font-medium mb-3">
            Analytics
          </span>
          <h2 className="text-4xl font-bold text-gray-900">Site traffic</h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Anonymous page-load counts for this portfolio: referrer and IP (for unique visitors) are stored when you
            load the site—no cookies, no third-party trackers.
          </p>
        </div>

        {isLoading ? (<div className="flex justify-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" aria-label="Loading analytics"/>
          </div>) : (<>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <MetricCard title="Total page views" value={analyticsData?.totalVisits ?? 0} hint="All time" icon={<i className="ri-eye-line text-xl"/>}/>
              <MetricCard title="Unique visitors" value={analyticsData?.uniqueVisitors ?? 0} hint="Estimated by IP address" icon={<i className="ri-user-line text-xl"/>}/>
              <MetricCard title="First recorded visit" value={analyticsData?.firstVisitAt
                ? new Date(analyticsData.firstVisitAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })
                : "—"} hint={trackingHint} icon={<i className="ri-calendar-line text-xl"/>}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b flex-wrap gap-3">
                  <CardTitle className="text-lg font-bold text-gray-900">Visits over time</CardTitle>
                  <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                    <TabsList className="grid grid-cols-3 h-8">
                      <TabsTrigger value="week" className="text-xs">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="year" className="text-xs">
                        Year
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-xs text-gray-500 mb-4">
                    Bucket counts for the selected range (server timezone). Totals above are all-time.
                  </p>
                  <div className="h-[250px]">
                    {labels.length > 0 ? (<Line options={lineChartOptions} data={visitorsChartData}/>) : (<div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        No data for this range yet.
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-lg font-bold text-gray-900">Traffic sources</CardTitle>
                  <p className="text-sm text-gray-500 font-normal mt-1">
                    Parsed from the HTTP referrer (Direct = no referrer or empty).
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[250px]">
                    {trafficEntries.length > 0 ? (<Doughnut options={doughnutChartOptions} data={locationChartData}/>) : (<div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
                        Chart appears after visits include referrer data. Your own direct loads usually show as Direct.
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Referrers</h3>
              <p className="text-sm text-gray-500 mb-6">
                Grouped sources (same buckets as the chart), sorted by visits. Share is of all recorded page loads.
              </p>

              {topReferrers.length === 0 ? (<p className="text-gray-600 text-sm">No referrer data yet—traffic will appear here as visits come in.</p>) : (<div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs font-medium text-gray-600 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 rounded-l-lg">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Visits
                        </th>
                        <th scope="col" className="px-6 py-3 rounded-r-lg">
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topReferrers.map((row, index) => (<tr key={`${row.source}-${index}`} className="bg-white border-b last:border-0">
                          <td className="px-6 py-4 font-medium text-gray-800">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-accent-100 text-accent rounded-lg flex items-center justify-center mr-3">
                                <i className="ri-links-line" aria-hidden/>
                              </div>
                              <span>{row.source}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium tabular-nums">{row.count}</td>
                          <td className="px-6 py-4 tabular-nums text-gray-700">{row.share}%</td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>)}
            </div>
          </>)}
      </div>
    </section>);
}
