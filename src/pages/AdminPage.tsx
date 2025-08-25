import { useState } from 'react';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { WorkspaceItem } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, Plus, Pencil, Trash2, ExternalLink, Monitor, Loader2,
  Palette, Layers, Grid3X3, Calendar, FileText, Code, Database, Cloud,
  Settings, Zap, Globe, ChartPieIcon, Briefcase, Smartphone, Laptop,
  BarChart3, Wrench, Target, Rocket, Lock, Lightbulb, Package, 
  FolderKanban, Users, LayoutGrid, Clock, Mail, Inbox, Search, MessageSquare,
  FileJson, PanelRight, LineChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const modernIconOptions = [
  { id: 'globe', icon: <Globe className="w-5 h-5" />, name: 'Globe' },
  { id: 'chart', icon: <ChartPieIcon className="w-5 h-5" />, name: 'Chart' },
  { id: 'briefcase', icon: <Briefcase className="w-5 h-5" />, name: 'Briefcase' },
  { id: 'mobile', icon: <Smartphone className="w-5 h-5" />, name: 'Mobile' },
  { id: 'laptop', icon: <Laptop className="w-5 h-5" />, name: 'Laptop' },
  { id: 'palette', icon: <Palette className="w-5 h-5" />, name: 'Design' },
  { id: 'chart2', icon: <BarChart3 className="w-5 h-5" />, name: 'Analytics' },
  { id: 'zap', icon: <Zap className="w-5 h-5" />, name: 'Energy' },
  { id: 'wrench', icon: <Wrench className="w-5 h-5" />, name: 'Tools' },
  { id: 'file', icon: <FileText className="w-5 h-5" />, name: 'Files' },
  { id: 'target', icon: <Target className="w-5 h-5" />, name: 'Target' },
  { id: 'rocket', icon: <Rocket className="w-5 h-5" />, name: 'Rocket' },
  { id: 'lock', icon: <Lock className="w-5 h-5" />, name: 'Security' },
  { id: 'cloud', icon: <Cloud className="w-5 h-5" />, name: 'Cloud' },
  { id: 'bulb', icon: <Lightbulb className="w-5 h-5" />, name: 'Idea' },
  { id: 'package', icon: <Package className="w-5 h-5" />, name: 'Package' },
  { id: 'kanban', icon: <FolderKanban className="w-5 h-5" />, name: 'Kanban' },
  { id: 'users', icon: <Users className="w-5 h-5" />, name: 'Team' },
  { id: 'grid', icon: <LayoutGrid className="w-5 h-5" />, name: 'Grid' },
  { id: 'clock', icon: <Clock className="w-5 h-5" />, name: 'Time' },
  { id: 'calendar', icon: <Calendar className="w-5 h-5" />, name: 'Calendar' },
  { id: 'mail', icon: <Mail className="w-5 h-5" />, name: 'Mail' },
  { id: 'inbox', icon: <Inbox className="w-5 h-5" />, name: 'Inbox' },
  { id: 'search', icon: <Search className="w-5 h-5" />, name: 'Search' }
];

const colorOptions = [
  { label: 'Ocean Blue', value: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { label: 'Purple Pink', value: 'bg-gradient-to-br from-purple-500 to-pink-600' },
  { label: 'Nature Green', value: 'bg-gradient-to-br from-green-500 to-teal-600' },
  { label: 'Sunset Orange', value: 'bg-gradient-to-br from-orange-500 to-red-600' },
  { label: 'Golden Sun', value: 'bg-gradient-to-br from-yellow-500 to-orange-600' },
  { label: 'Sky Blue', value: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
  { label: 'Rose Pink', value: 'bg-gradient-to-br from-rose-500 to-pink-600' },
  { label: 'Deep Violet', value: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { label: 'Emerald', value: 'bg-gradient-to-br from-emerald-500 to-green-600' },
  { label: 'Dark Gray', value: 'bg-gradient-to-br from-slate-500 to-gray-600' }
];

export default function AdminPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useWorkspaceStore();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkspaceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'external' as 'external' | 'embed' | 'nested',
    icon: 'globe',
    parentId: 'none',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      type: 'external',
      icon: 'globe',
      parentId: 'none',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please fill in title');
      return;
    }
    
    if (formData.type !== 'nested' && !formData.url) {
      toast.error('Please fill in URL for non-nested items');
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        toast.success('Work area updated successfully');
      } else {
        await addItem(formData);
        toast.success('Work area added successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save work area');
      console.error('Error saving work area:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: WorkspaceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      url: item.url,
      type: item.type,
      icon: item.icon || 'globe',
      color: item.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work area?')) {
      try {
        await deleteItem(id);
        toast.success('Work area deleted successfully');
      } catch (error) {
        toast.error('Failed to delete work area');
        console.error('Error deleting work area:', error);
      }
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Work Area
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Work Area' : 'Add Work Area'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter work area title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter work area description"
                      className="resize-none"
                    />
                  </div>

                  {formData.type !== 'nested' ? (
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com"
                        required={formData.type !== 'nested'}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Parent Workspace (Optional)</Label>
                      <Select 
                        value={formData.parentId} 
                        onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No parent (Top-level)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No parent (Top-level)</SelectItem>
                          {items
                            .filter(item => item.type === 'nested' && (!editingItem || item.id !== editingItem.id))
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.title}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'external' | 'embed') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="external">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            External Link (Opens in new tab)
                          </div>
                        </SelectItem>
                        <SelectItem value="embed">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            Embedded Page (Opens within platform)
                          </div>
                        </SelectItem>
                        <SelectItem value="nested">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="w-4 h-4" />
                            Nested Cards (Shows child workspaces)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Choose Icon</Label>
                      <div className="grid grid-cols-8 gap-3">
                        {modernIconOptions.map((option) => (
                          <Button
                            key={option.id}
                            type="button"
                            variant={formData.icon === option.id ? "default" : "outline"}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              formData.icon === option.id 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                                : 'hover:bg-blue-50/50'
                            }`}
                            onClick={() => setFormData({ ...formData, icon: option.id })}
                          >
                            {option.icon}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Choose Color Theme</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {colorOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            className={`w-16 h-16 rounded-2xl border-2 ${
                              formData.color === option.value 
                                ? 'border-blue-500 shadow-lg scale-105' 
                                : 'border-gray-200 hover:border-gray-300'
                            } transition-all duration-200`}
                            onClick={() => setFormData({ ...formData, color: option.value })}
                          >
                            <div className={`w-10 h-10 rounded-xl ${option.value} shadow-inner`} />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingItem ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingItem ? 'Update' : 'Add'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Work Areas</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No work areas yet. Click the button above to add your first one.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className={`w-8 h-8 rounded ${item.color || 'bg-gray-500'} flex items-center justify-center text-white`}>
                          {item.icon || '🔗'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.type === 'external' ? (
                            <>
                              <ExternalLink className="w-4 h-4" />
                              External Link
                            </>
                          ) : (
                            <>
                              <Monitor className="w-4 h-4" />
                              Embedded Page
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline max-w-xs truncate block"
                        >
                          {item.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}