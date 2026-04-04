type ChatPreviewCardProps = {
  children: React.ReactNode;
};

export function ChatPreviewCard({ children }: ChatPreviewCardProps) {
  return <div className="mt-1.5">{children}</div>;
}
