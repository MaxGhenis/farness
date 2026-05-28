export function GET() {
  return Response.json({
    ok: true,
    service: "farness-forecast-api",
  });
}
