import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FolderKanban, Activity, Bell } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Monitor and manage your services</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No projects yet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Health Checks</CardTitle>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
                        <Bell className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No recent alerts</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Follow these steps to set up your service monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-4">
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                1
                            </span>
                            <div>
                                <p className="font-medium">Create a Project</p>
                                <p className="text-sm text-muted-foreground">
                                    Go to Projects and create your first project to get started
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                2
                            </span>
                            <div>
                                <p className="font-medium">Configure Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Set up email and Notion integrations for failure notifications
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                3
                            </span>
                            <div>
                                <p className="font-medium">Add Health Checks</p>
                                <p className="text-sm text-muted-foreground">
                                    Create automated health checks for your services
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                4
                            </span>
                            <div>
                                <p className="font-medium">Connect Portainer</p>
                                <p className="text-sm text-muted-foreground">
                                    Link your Portainer stacks for infrastructure management
                                </p>
                            </div>
                        </li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
