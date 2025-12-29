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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export function ItemsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState({ title: "", description: "" });
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!createFormData.title.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      const response = await apiClient.createItem(createFormData.title, createFormData.description || undefined);
      setItems([response.item, ...items]);
      setCreateFormData({ title: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editFormData.title.trim()) return;

    try {
      setError(null);
      const response = await apiClient.updateItem(id, editFormData.title, editFormData.description || undefined);
      setItems(items.map(item => item.id === id ? response.item : item));
      setEditingId(null);
      setEditFormData({ title: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const openDeleteDialog = (item: Item) => {
    setItemToDelete({ id: item.id, title: item.title });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);
      await apiClient.deleteItem(itemToDelete.id);
      setItems(items.filter(item => item.id !== itemToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditFormData({ title: item.title, description: item.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ title: "", description: "" });
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
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                placeholder="Enter title"
                required
                disabled={isCreating || editingId !== null}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder="Enter description (optional)"
                disabled={isCreating || editingId !== null}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isCreating || editingId !== null}>
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
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`edit-desc-${item.id}`}>Description</Label>
                          <Input
                            id={`edit-desc-${item.id}`}
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
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
                          <Button onClick={() => openDeleteDialog(item)} variant="destructive" size="sm">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete item <strong>"{itemToDelete?.title}"</strong>?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

