"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, Plus, Search } from "lucide-react";

interface Source {
  id: string;
  name: string;
  url: string;
  bias_label: string;
  factuality_score: number;
  active: boolean;
}

const biasColorMap: Record<string, string> = {
  "Pro-Federal-Government": "bg-blue-100 text-blue-800 dark:bg-blue-900",
  Independent: "bg-green-100 text-green-800 dark:bg-green-900",
  "Opposition-Leaning": "bg-red-100 text-red-800 dark:bg-red-900",
};

export default function SourcesManagementPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBias, setFilterBias] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    bias_label: "Independent",
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/admin/sources");
      const data = await res.json();
      setSources(data);
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSource = async () => {
    if (!formData.name || !formData.url) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(
        editingId ? `/api/admin/sources/${editingId}` : "/api/admin/sources",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        alert(
          editingId
            ? "Source updated successfully"
            : "Source added successfully"
        );
        setFormData({ name: "", url: "", bias_label: "Independent" });
        setEditingId(null);
        setShowForm(false);
        fetchSources();
      }
    } catch (error) {
      alert("Failed to save source: " + error);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;

    try {
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Source deleted successfully");
        fetchSources();
      }
    } catch (error) {
      alert("Failed to delete source: " + error);
    }
  };

  const handleEditSource = (source: Source) => {
    setFormData({
      name: source.name,
      url: source.url,
      bias_label: source.bias_label,
    });
    setEditingId(source.id);
    setShowForm(true);
  };

  const filteredSources = sources.filter(
    (s) =>
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.url.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterBias === "all" || s.bias_label === filterBias)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading sources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            News Sources Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage sources and their bias classification
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", url: "", bias_label: "Independent" });
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? "Edit Source" : "Add New Source"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Source Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Punch Newspaper"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">URL</label>
              <Input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="e.g., https://punchng.com"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Bias Classification
              </label>
              <Select
                value={formData.bias_label}
                onValueChange={(value) =>
                  setFormData({ ...formData, bias_label: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pro-Federal-Government">
                    Pro-Government
                  </SelectItem>
                  <SelectItem value="Independent">Independent</SelectItem>
                  <SelectItem value="Opposition-Leaning">Opposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSaveSource} className="flex-1">
                {editingId ? "Update Source" : "Add Source"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <Search className="h-4 w-4 absolute mt-2.5 ml-3 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterBias} onValueChange={setFilterBias}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Biases</SelectItem>
            <SelectItem value="Pro-Federal-Government">Pro-Government</SelectItem>
            <SelectItem value="Independent">Independent</SelectItem>
            <SelectItem value="Opposition-Leaning">Opposition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sources Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Bias
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSources.map((source) => (
                <tr
                  key={source.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {source.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {source.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      className={biasColorMap[source.bias_label] || ""}
                    >
                      {source.bias_label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {source.factuality_score.toFixed(1)}/10
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSource(source)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleDeleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSources.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No sources found</p>
          </div>
        )}
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredSources.length} of {sources.length} sources
      </div>
    </div>
  );
}
