"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePriceAskForm } from "@/ui/prices/hooks/use-price-ask-form";

const PRESETS = [
  "What were the min, max and average prices in Greece today?",
  "How did yesterday compare to today?",
  "Did the last ingestion run skip unrealistic points?",
];

export function PriceAskCard() {
  const { form, onSubmit, askPreset, isLoading, answer, error } = usePriceAskForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Ask the prices</CardTitle>
        <CardDescription>
          Answers come from stored daily stats and ingestion runs, not from the model inventing
          numbers
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              className="h-auto max-w-full py-1.5 text-left whitespace-normal"
              disabled={isLoading}
              onClick={() => askPreset(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="price-ask" className="sr-only">
              Question
            </Label>
            <Input
              id="price-ask"
              placeholder="Ask about GR day-ahead prices…"
              disabled={isLoading}
              aria-invalid={Boolean(errors.question)}
              {...register("question")}
            />
            {errors.question ? (
              <p className="text-destructive text-xs">{errors.question.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isLoading} className="sm:mt-0">
            {isLoading ? "Asking…" : "Ask"}
          </Button>
        </form>

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        {answer ? (
          <p className="bg-muted/50 rounded-lg px-3 py-3 text-sm leading-relaxed">{answer}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
