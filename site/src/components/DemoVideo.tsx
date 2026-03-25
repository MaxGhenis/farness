export function DemoVideo({
  caption,
}: {
  caption?: string;
}) {
  return (
    <figure className="m-0">
      <div className="rounded-[28px] overflow-hidden border border-[#D9E4EC] bg-white shadow-[0_20px_50px_rgba(20,32,43,0.12)]">
        <video
          className="block w-full h-auto"
          autoPlay
          controls
          loop
          muted
          playsInline
          poster="/demo/farness-demo-poster.png"
          preload="metadata"
          aria-label="End-to-end farness workflow demo for Codex"
        >
          <source src="/demo/farness-demo.mp4" type="video/mp4" />
        </video>
      </div>
      {caption ? (
        <figcaption className="mt-4 text-[0.82rem] text-[#6B7C89] leading-[1.6]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
