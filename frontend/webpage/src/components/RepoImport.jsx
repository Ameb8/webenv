import { useEffect, useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import csrfAxios from '../util/csrfAxios';

export default function RepoImport({ folderId }) {
    const [repos, setRepos] = useState([]);
    const [selectedRepoUrl, setSelectedRepoUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await csrfAxios.get('/git/repos/');
                setRepos(response.data);
            } catch (err) {
                console.error('Failed to load repos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, []);

    const handleImport = async () => {
        if (!selectedRepoUrl) return;

        try {
            await csrfAxios.post('/git/repos/', {
                repo_url: selectedRepoUrl,
                folder_id: folderId,
            });
            alert('Repository imported successfully!');
        } catch (err) {
            console.error('Failed to import repository:', err);
            alert('Failed to import repository.');
        }
    };

    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    return (
        <div>
            <Form.Group>
                <Form.Label>Select a Repository to Import</Form.Label>
                <Form.Select
                    value={selectedRepoUrl}
                    onChange={(e) => setSelectedRepoUrl(e.target.value)}
                >
                    <option value="">-- Select Repository --</option>
                    {repos.map((repo) => (
                        <option key={repo.url} value={repo.html_url}>
                            {repo.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Button
                variant="success"
                className="mt-3"
                onClick={handleImport}
                disabled={!selectedRepoUrl}
            >
                Import Repository
            </Button>
        </div>
    );
}
