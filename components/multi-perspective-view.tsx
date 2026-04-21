'use client';

import Image from 'next/image';
import { ExternalLink, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ArticleWithSource {
  id: string;
  title: string;
  url: string;
  content?: string | null;
  image_url?: string | null;
  published_at?: string;
  source: {
    id: string;
    name: string;
    bias_label?: string | null;
    website_url?: string | null;
    factuality_score?: number | null;
  };
}

interface Perspectives {
  proGov: ArticleWithSource[];
  independent: ArticleWithSource[];
  opposition: ArticleWithSource[];
}

interface Props {
  perspectives: Perspectives;
}

function getBiasBadge(bias?: string | null) {
  if (!bias) return { color: 'bg-slate-100', label: 'Neutral', emoji: '🟢' };
  const lower = bias.toLowerCase();
  if (lower.includes('pro-gov') || lower.includes('government')) {
    return { color: 'bg-red-100', label: 'Pro-Gov', emoji: '🔴' };
  }
  if (lower.includes('opposition')) {
    return { color: 'bg-blue-100', label: 'Opposition', emoji: '🔵' };
  }
  return { color: 'bg-green-100', label: 'Independent', emoji: '🟢' };
}

export function MultiPerspectiveView({ perspectives }: Props) {
  const sections = [
    { title: '🔴 Pro-Government Perspective', articles: perspectives.proGov },
    { title: '🟢 Independent Perspective', articles: perspectives.independent },
    { title: '🔵 Opposition Perspective', articles: perspectives.opposition },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-xl font-bold mb-4 text-foreground">
            {section.title}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({section.articles.length} {section.articles.length === 1 ? 'outlet' : 'outlets'})
            </span>
          </h2>

          {section.articles.length === 0 ? (
            <Card className="p-6 bg-muted/50 border-dashed">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>No coverage from this perspective</span>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {section.articles.map((article) => {
                const bias = getBiasBadge(article.source?.bias_label);
                return (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex gap-4 p-4">
                        {/* Image */}
                        {article.image_url && (
                          <div className="hidden sm:block shrink-0 w-32 h-32 relative rounded-md overflow-hidden bg-muted">
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            {/* Source info */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${bias.color} text-black text-xs`}>
                                {bias.emoji} {bias.label}
                              </Badge>
                              {article.source?.factuality_score && (
                                <Badge variant="secondary" className="text-xs">
                                  {article.source.factuality_score}% factual
                                </Badge>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-blue-600 transition-colors mb-2">
                              {article.title}
                            </h3>

                            {/* Preview */}
                            {article.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {article.content}
                              </p>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="text-xs text-muted-foreground font-medium">
                              {article.source?.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {article.published_at && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(article.published_at).toLocaleDateString('en-NG', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
