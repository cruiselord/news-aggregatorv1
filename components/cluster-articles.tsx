"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { classifyBias } from "@/lib/utils";
import Image from "next/image";

export interface ArticleItem {
  id: string;
  title: string;
  url: string;
  content?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  source_id: string | null;
  bias_label: string | null;
  factuality_score: number | null;
}

export interface SourceItem {
  id: string;
  name: string;
  bias: "pro-gov" | "independent" | "opposition";
  factuality: number;
  region: string;
  ownership: string;
  ownerName: string;
  url: string;
}

interface Props {
  articles: ArticleItem[];
  sources: SourceItem[];
}

export function ClusterArticles({ articles, sources }: Props) {
  const [filter, setFilter] = useState<
    "all" | "pro-gov" | "independent" | "opposition"
  >("all");

  const filtered = articles.filter((a) => {
    if (filter === "all") return true;
    return classifyBias(a.bias_label) === filter;
  });

  return (
    <>
      <div className="flex gap-2 text-xs mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 ${filter === "all" ? "bg-[#008751] text-white" : "bg-secondary"}`}
        >
          All ({articles.length})
        </button>
        <button
          onClick={() => setFilter("pro-gov")}
          className={`rounded-full px-3 py-1 ${filter === "pro-gov" ? "bg-[#008751] text-white" : "bg-secondary"}`}
        >
          Left ({articles.filter((a) => classifyBias(a.bias_label) === "pro-gov").length})
        </button>
        <button
          onClick={() => setFilter("independent")}
          className={`rounded-full px-3 py-1 ${filter === "independent" ? "bg-[#008751] text-white" : "bg-secondary"}`}
        >
          Center ({articles.filter((a) => classifyBias(a.bias_label) === "independent").length})
        </button>
        <button
          onClick={() => setFilter("opposition")}
          className={`rounded-full px-3 py-1 ${filter === "opposition" ? "bg-[#008751] text-white" : "bg-secondary"}`}
        >
          Right ({articles.filter((a) => classifyBias(a.bias_label) === "opposition").length})
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((a) => {
          const src = sources.find((s) => s.id === a.source_id);
          const bias = classifyBias(a.bias_label);
          const snippet = (a.content ?? "").replace(/\s+/g, " ").trim();
          return (
            <div key={a.id} className="rounded-lg border border-border bg-card p-3">
              {a.image_url && (
                <div className="relative mb-3 h-44 w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={a.image_url}
                    alt={a.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:underline"
              >
                {a.title}
              </a>
              {snippet && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  {snippet}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {src && <span>{src.name}</span>}
                {a.published_at && (
                  <span>
                    {new Date(a.published_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {a.factuality_score != null && (
                  <Badge variant="secondary" className="text-xs">
                    {a.factuality_score}
                  </Badge>
                )}
                <Badge
                  variant={
                    bias === "pro-gov"
                      ? "destructive"
                      : bias === "opposition"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-xs capitalize"
                >
                  {bias.replace("-", " ")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
