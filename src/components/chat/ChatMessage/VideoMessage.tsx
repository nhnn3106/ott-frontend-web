export const VideoMessage = ({ url }: { url: string }) => {
  return (
    <div className="space-y-2">
      <video
        src={url}
        controls
        className="max-w-full rounded-lg shadow-sm"
        style={{ maxHeight: "300px", minWidth: "200px" }}
        preload="metadata"
      />
    </div>
  );
};
