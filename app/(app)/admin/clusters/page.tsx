"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, AlertTriangle } from "lucide-react";

interface Cluster {
  id: string;
  headline: string;
  ai_summary: string;
  article_count: number;
  pro_gov_coverage: number;
  independent_coverage: number;
  opposition_coverage: number;
  is_blindspot: boolean;
  blindspot_type?: string;
  created_at: string;
}

export default function ClustersManagementPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBlindspotOnly, setShowBlindspotOnly] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const res = await fetch("/api/admin/clusters");
      const data = await res.json();
      setClusters(data);
    } catch (error) {
      console.error("Failed to fetch clusters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCluster = async (id: string) => {
    if (!confirm("Delete this cluster and unlink all articles?")) return;

    try {
      const res = await fetch(`/api/admin/clusters/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Cluster deleted successfully");
        fetchClusters();
        setSelectedCluster(null);
      }
    } catch (error) {
      alert("Failed to delete cluster: " + error);
    }
  };

  const filteredClusters = clusters.filter(
    (c) =>
      (c.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ai_summary.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showBlindspotOnly || c.is_blindspot)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading clusters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Story Clusters Management
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage story clusters
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-64">
          <Search className="h-4 w-4 absolute mt-2.5 ml-3 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search clusters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showBlindspotOnly ? "default" : "outline"}
          onClick={() => setShowBlindspotOnly(!showBlindspotOnly)}
          size="sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Blind Spots Only
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clusters List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredClusters.map((cluster) => (
            <Card
              key={cluster.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedCluster?.id === cluster.id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => setSelectedCluster(cluster)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {cluster.headline}
                  </h3>
                  {cluster.is_blindspot && (
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 shrink-0">
                      Blind Spot
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cluster.ai_summary}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📰 {cluster.article_count} articles</span>
                  <span>📅 {new Date(cluster.created_at).toLocaleDateString()}</span>
                </div>

                {/* Mini Bias Bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${cluster.pro_gov_coverage}%` }}
                    className="bg-blue-500"
                  />
                  <div
                    style={{ width: `${cluster.independent_coverage}%` }}
                    className="bg-green-500"
                  />
                  <div
                    style={{ width: `${cluster.opposition_coverage}%` }}
                    className="bg-red-500"
                  />
                </div>
              </div>
            </Card>
          ))}

          {filteredClusters.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No clusters found
            </div>
          )}
        </div>

        {/* Cluster Details Sidebar */}
        {selectedCluster && (
          <Card className="p-6 h-fit sticky top-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Details
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Headline
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {selectedCluster.headline}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Summary
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCluster.ai_summary}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    <p className="text-xs text-muted-foreground">Pro-Gov</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedCluster.pro_gov_coverage}%
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                    <p className="text-xs text-muted-foreground">Independent</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedCluster.independent_coverage}%
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
                    <p className="text-xs text-muted-foreground">Opposition</p>
                    <p className="text-lg font-bold text-red-600">
                      {selectedCluster.opposition_coverage}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Articles
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {selectedCluster.article_count}
                  </p>
                </div>

                {selectedCluster.is_blindspot && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-200">
                      ⚠️ Blind Spot Detected
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                      {selectedCluster.blindspot_type}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    window.open(`/story/${selectedCluster.id}`, "_blank");
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Story
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                  onClick={() => handleDeleteCluster(selectedCluster.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cluster
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredClusters.length} of {clusters.length} clusters
      </div>
    </div>
  );
}
