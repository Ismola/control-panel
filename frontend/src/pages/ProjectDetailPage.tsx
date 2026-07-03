import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
                <p className="text-gray-500 mt-1">Project ID: {id}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        This page is under development. See FRONTEND_IMPLEMENTATION.md for implementation details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Project detail page with tabs for Email Config, Notion Config, Health Checks, and Portainer will be
                        implemented here.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
