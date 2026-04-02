import type { CompanionMessage } from '../domain/companion.types';
import { CompanionMessageBubble } from './CompanionMessageBubble';

type CompanionMessageListProps = {
  messages: CompanionMessage[];
};

export function CompanionMessageList({ messages }: CompanionMessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <CompanionMessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
