import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from '../components/ui/toaster';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

interface Project {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
}

export default function ProjectsPage() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await apiClient.get<Project[]>('/api/projects');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            const response = await apiClient.post('/api/projects', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setShowCreateForm(false);
            setNewProjectName('');
            setNewProjectDescription('');
            toast({ title: 'Success', description: 'Project created successfully' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/api/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({ title: 'Success', description: 'Project deleted successfully' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name: newProjectName,
            description: newProjectDescription,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage your monitoring projects</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>

            {showCreateForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Create New Project</CardTitle>
                        <CardDescription>Add a new project to monitor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Project Name
                                </label>
                                <Input
                                    id="name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="My Service"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </label>
                                <Input
                                    id="description"
                                    value={newProjectDescription}
                                    onChange={(e) => setNewProjectDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Creating...' : 'Create Project'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
                        </CardContent>
                    </Card>
                )}

                {projects?.map((project) => (
                    <Card key={project._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>{project.description || 'No description'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => navigate(`/projects/${project._id}`)}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this project?')) {
                                            deleteMutation.mutate(project._id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
