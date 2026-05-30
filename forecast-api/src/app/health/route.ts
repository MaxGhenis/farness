export function GET() {
  return Response.json({
    ok: true,
    service: "brier-forecast-api",
  });
}
