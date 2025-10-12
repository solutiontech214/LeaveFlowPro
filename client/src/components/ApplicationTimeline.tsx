import { CheckCircle, Circle, XCircle } from "lucide-react";

interface TimelineStep {
  name: string;
  status: "completed" | "current" | "pending" | "rejected";
  date?: string;
}

interface ApplicationTimelineProps {
  steps: TimelineStep[];
}

export function ApplicationTimeline({ steps }: ApplicationTimelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.name} className="flex gap-4" data-testid={`timeline-step-${index}`}>
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2">
                {step.status === "completed" && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {step.status === "current" && (
                  <Circle className="h-5 w-5 fill-primary text-primary" />
                )}
                {step.status === "pending" && (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                {step.status === "rejected" && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              {!isLast && (
                <div className={`mt-1 h-12 w-0.5 ${
                  step.status === "completed" ? "bg-success" : "bg-border"
                }`} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p className={`font-medium ${
                step.status === "current" ? "text-primary" :
                step.status === "rejected" ? "text-destructive" :
                step.status === "completed" ? "text-foreground" :
                "text-muted-foreground"
              }`}>
                {step.name}
              </p>
              {step.date && (
                <p className="text-sm text-muted-foreground">{step.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
