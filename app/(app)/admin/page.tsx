"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";

interface AdminStats {
  totalArticles: number;
  totalClusters: number;
  blindspots: number;
  sources: number;
  cacheStats: Record<string, any>;
  lastClusteringTime?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReClustering = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/re-cluster", { method: "POST" });
      const data = await res.json();
      alert(`Re-clustering complete: ${data.clusterCount} clusters created`);
      fetchStats();
    } catch (error) {
      alert("Re-clustering failed: " + error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInvalidateCache = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/admin/cache/invalidate", { method: "POST" });
      alert("Cache invalidated successfully");
      fetchStats();
    } catch (error) {
      alert("Failed to invalidate cache: " + error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScrapeFeeds = async () => {
    setIsScraping(true);
    try {
      const res = await fetch("/api/admin/scrape", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Scrape failed");
      }

      const message = data?.message || 
        `✅ Added ${data?.newArticles ?? 0} articles, created ${data?.clustersCreated ?? 0} clusters`;
      
      const errorDetails = Array.isArray(data?.errors) && data.errors.length > 0
        ? `\n\nWarnings:\n${data.errors.join("\n")}`
        : "";

      alert(message + errorDetails);
      
      // Refresh stats to show updated numbers
      setTimeout(() => {
        fetchStats();
      }, 1500);
    } catch (error) {
      alert("Scrape failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsScraping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Platform statistics and content management
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.totalArticles || 0}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Story Clusters</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.totalClusters || 0}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Blind Spots</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats?.blindspots || 0}
              </p>
            </div>
            <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">News Sources</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.sources || 0}
              </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cache Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Cache Performance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.cacheStats &&
            Object.entries(stats.cacheStats).map(([name, data]: [string, any]) => (
              <div
                key={name}
                className="p-3 rounded-lg border border-border bg-card/50"
              >
                <p className="text-sm font-medium text-foreground capitalize">
                  {name} Cache
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Hits: <span className="font-semibold">{data.hits}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Misses: <span className="font-semibold">{data.misses}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hit Rate:{" "}
                    <Badge variant="secondary" className="ml-1">
                      {(data.hitRate * 100).toFixed(1)}%
                    </Badge>
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Admin Actions */}
      <Card className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Admin Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              Re-cluster Articles
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Re-run the clustering algorithm on all articles with improved
              algorithms.
            </p>
            <Button
              onClick={handleReClustering}
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRefreshing ? "Processing..." : "Run Re-clustering"}
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Scrape RSS Feeds</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pull latest stories from configured source RSS feeds and store them
              in the articles table.
            </p>
            <Button
              onClick={handleScrapeFeeds}
              disabled={isScraping}
              className="w-full"
              variant="secondary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isScraping ? "Scraping..." : "Run RSS Scrape"}
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              Invalidate Cache
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clear all cached data to force refresh of trending and blind spot
              data.
            </p>
            <Button
              onClick={handleInvalidateCache}
              disabled={isRefreshing}
              variant="outline"
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isRefreshing ? "Processing..." : "Invalidate Cache"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Info */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900 border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">
              Last Clustering:{" "}
              <span className="font-medium text-foreground">
                {stats?.lastClusteringTime || "Never"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              System Status:{" "}
              <Badge className="ml-2 bg-green-100 text-green-800">
                Operational
              </Badge>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
