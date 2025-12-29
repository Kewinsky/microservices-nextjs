"use client";

import { useState, useEffect } from "react";
import { apiClient, type Item } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ItemsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getItems();
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      const response = await apiClient.createItem(formData.title, formData.description || undefined);
      setItems([response.item, ...items]);
      setFormData({ title: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.title.trim()) return;

    try {
      setError(null);
      const response = await apiClient.updateItem(id, formData.title, formData.description || undefined);
      setItems(items.map(item => item.id === id ? response.item : item));
      setEditingId(null);
      setFormData({ title: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      setError(null);
      await apiClient.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({ title: item.title, description: item.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", description: "" });
  };

  if (loading) {
    return <div className="p-4">Loading items...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Item</CardTitle>
          <CardDescription>Add a new item to your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
                required
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                disabled={isCreating}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Item"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Items</CardTitle>
          <CardDescription>Manage your items</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">No items yet. Create your first item above.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    {editingId === item.id ? (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-title-${item.id}`}>Title</Label>
                          <Input
                            id={`edit-title-${item.id}`}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-desc-${item.id}`}>Description</Label>
                          <Input
                            id={`edit-desc-${item.id}`}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(item.id)} size="sm">
                            Save
                          </Button>
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(item.created_at).toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button onClick={() => startEdit(item)} variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(item.id)} variant="destructive" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

