type ChatPreviewCardProps = {
  children: React.ReactNode;
};

export function ChatPreviewCard({ children }: ChatPreviewCardProps) {
  return <div className="mt-2">{children}</div>;
}
