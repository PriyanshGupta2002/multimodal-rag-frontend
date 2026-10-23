"use client";

import { Coins } from "lucide-react";
import type { TokenUsage } from "../services/chat-service";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatTokenCount(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function MessageUsage({ usage }: { usage: TokenUsage }) {
  const details = [
    ["Input tokens", usage.input_tokens],
    ["Output tokens", usage.output_tokens],
    ["Total tokens", usage.total_tokens],
    ["Cache read", usage.input_token_details?.cache_read],
    ["Cache creation", usage.input_token_details?.cache_creation],
    ["Reasoning tokens", usage.output_token_details?.reasoning],
  ].filter((item): item is [string, number] => typeof item[1] === "number");

  if (!details.length) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Token usage: ${formatTokenCount(
              usage.input_tokens ?? 0,
            )} input, ${formatTokenCount(usage.output_tokens ?? 0)} output`}
            className="text-muted-foreground"
          />
        }
      >
        <Coins className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="block space-y-1 p-3">
        {details.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-6">
            <span>{label}</span>
            <span className="font-medium tabular-nums">
              {formatTokenCount(value)}
            </span>
          </div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
