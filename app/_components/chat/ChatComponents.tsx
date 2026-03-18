type PropertyCardProps = {
  image?: string | null;
  rawImage?: string | null;
  title: string;
  price?: string;
  location?: string;
};

export function PropertyCard({
  image,
  rawImage,
  title,
  price,
  location,
}: PropertyCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={title}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex min-h-40 w-full flex-col justify-center gap-2 bg-gray-100 p-4">
          <span className="text-sm font-medium text-gray-700">
            Imagem indisponível
          </span>

          {rawImage ? (
            <a
              href={rawImage}
              target="_blank"
              rel="noreferrer"
              className="break-all text-xs text-blue-600 underline">
              {rawImage}
            </a>
          ) : (
            <span className="break-all text-xs text-gray-500">
              Link da imagem não informado
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {title}
        </h3>

        {price && (
          <p className="mt-2 text-base font-bold text-[#00c1ac]">{price}</p>
        )}

        {location && <p className="mt-1 text-xs text-gray-500">{location}</p>}
      </div>
    </div>
  );
}

type ChatBubbleProps = {
  role: "assistant" | "user";
  content?: string;
  children?: React.ReactNode;
};

export function ChatBubble({ role, content, children }: ChatBubbleProps) {
  const isUser = role === "user";
  const body = children ?? content;

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm whitespace-pre-wrap break-words",
          isUser
            ? "bg-[#00c1ac] text-white rounded-br-md"
            : "bg-[#eeeeee] text-gray-800 rounded-bl-md",
        ].join(" ")}>
        {body}
      </div>
    </div>
  );
}
