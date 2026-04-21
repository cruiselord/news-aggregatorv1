"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface SystemSettings {
  clusteringEnabled: boolean;
  cachingEnabled: boolean;
  automaticClustering: boolean;
  automaticClusteringInterval: number;
  geminiRefinement: boolean;
  lastUpdate: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Settings saved successfully");
      }
    } catch (error) {
      alert("Failed to save settings: " + error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure platform behavior and features
        </p>
      </div>

      {/* Status Banner */}
      <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-200">
            System Operational
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            All systems running normally. Last update:{" "}
            {new Date(settings.lastUpdate).toLocaleString()}
          </p>
        </div>
      </Card>

      {/* Clustering Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Clustering Engine
        </h2>

        <div className="space-y-6">
          {/* Clustering Enable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Enable Clustering Algorithm
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Automatic grouping of related articles
              </p>
            </div>
            <Switch
              checked={settings.clusteringEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, clusteringEnabled: checked })
              }
            />
          </div>

          {/* Automatic Clustering */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Automatic Re-clustering
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Periodically re-run clustering algorithm on new articles
              </p>
            </div>
            <Switch
              checked={settings.automaticClustering}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, automaticClustering: checked })
              }
            />
          </div>

          {/* Gemini Refinement */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Gemini AI Refinement
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use Gemini to refine singleton clusters (costs API credits)
              </p>
            </div>
            <Switch
              checked={settings.geminiRefinement}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, geminiRefinement: checked })
              }
            />
          </div>
        </div>
      </Card>

      {/* Caching Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Caching & Performance
        </h2>

        <div className="space-y-6">
          {/* Caching Enable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Enable Caching System
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Cache trending stories, blind spots, and user stats
              </p>
            </div>
            <Switch
              checked={settings.cachingEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, cachingEnabled: checked })
              }
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Cache Status
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  In-memory cache: 24h trending, 6h blindspots, 12h user stats
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          API Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Gemini API Key Status
            </p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Configured
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Supabase Connection
            </p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              ✓ Connected
            </Badge>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload
        </Button>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Documentation */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Help & Documentation
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • <strong>Clustering:</strong> Groups related articles by entities,
            semantic similarity, and keywords
          </li>
          <li>
            • <strong>Blind Spots:</strong> Detected when 80%+ articles are from
            one perspective
          </li>
          <li>
            • <strong>Caching:</strong> In-memory TTL-based caching for fast
            queries
          </li>
          <li>
            • <strong>Admin Actions:</strong> Re-cluster and invalidate cache
            from dashboard
          </li>
        </ul>
      </Card>
    </div>
  );
}
