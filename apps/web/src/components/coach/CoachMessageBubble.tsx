import { cn } from "@/lib/utils";
import type { CoachMessage } from "@/hooks/useVoiceCoach";

interface CoachMessageBubbleProps {
  message:   CoachMessage;
  className?: string;
}

export function CoachMessageBubble({ message, className }: CoachMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-soprano/20 border border-soprano/30
                        flex items-center justify-center text-soprano text-xs font-bold
                        shrink-0 mt-1 mr-2">
          P
        </div>
      )}

      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-soprano/20 border border-soprano/30 text-white rounded-br-sm"
          : "bg-background-secondary border border-border text-white rounded-bl-sm"
      )}>
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1.5",
          isUser ? "text-soprano/60 text-right" : "text-muted"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

/** Animated "thinking" bubble shown while awaiting response */
export function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 rounded-full bg-soprano/20 border border-soprano/30
                      flex items-center justify-center text-soprano text-xs font-bold
                      shrink-0 mt-1 mr-2">
        P
      </div>
      <div className="bg-background-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
