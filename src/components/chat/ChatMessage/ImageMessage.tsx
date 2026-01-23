export const ImageMessage = ({ url }: { url: string }) => {
  return (
    <div className="space-y-2">
      <img
        src={url}
        alt="Attachment"
        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
        style={{ maxHeight: "300px", minWidth: "200px" }}
        onClick={() => window.open(url, "_blank")}
        loading="lazy"
      />
    </div>
  );
};
