export type BiasType = "pro-gov" | "independent" | "opposition";

export interface Story {
  id: string;
  headline: string;
  summary: string;
  sourceCount: number;
  readTime: string;
  isBlindspot: boolean;
  blindspotPercent?: number;
  blindspotSide?: string;
  thumbnail: string;
  date: string;
  biasBreakdown: {
    proGov: number;
    independent: number;
    opposition: number;
  };
  topic: string;
}

