
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import csrfAxios from '../util/csrfAxios';
import FileTree from './FileTree';

function GitHubPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [importingRepoId, setImportingRepoId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [folderTree, setFolderTree] = useState([]); // ✅ local folder tree state
    const [folderLoading, setFolderLoading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const toggleDropdown = async () => {
        const nextOpenState = !isOpen;
        setIsOpen(nextOpenState);

        if (nextOpenState && repos.length === 0) {
            setLoading(true);
            setError(null);
            try {
                const response = await csrfAxios.get(`/git/repos/`);
                setRepos(response.data);
            } catch (err) {
                setError('Failed to load repositories.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenImportModal = async (repo) => {
        setSelectedRepo(repo);
        setShowModal(true);

        if (folderTree.length === 0) {
            setFolderLoading(true);
            try {
                const res = await csrfAxios.get('/file-sys/filesystem/');
                console.log("Fetched folder tree for GitHubPanel:", res.data); // DEBUG
                setFolderTree(res.data);
            } catch (err) {
                console.error("Failed to load folder tree:", err);
            } finally {
                setFolderLoading(false);
            }
        }
    };

    const handleFolderSelect = async (selection) => {
        console.log("handleFolderSelect()")
        if (selection.type !== 'folder') return;
        const folderId = selection.data.id;

        console.log(folder)

        if (!selectedRepo) return;

        setImportingRepoId(selectedRepo.id);

        try {
            const response = await csrfAxios.post(`/git/repos/`, {
                folder_id: folderId,
                repo_url: selectedRepo.url,
            });

            alert(`Imported repo into folder ID ${response.data.folder_id}`);

            console.log(`Repo:`) // DEBUG ***
            console.log(electedRepo) // DEBUG ***

            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to import repository.');
        } finally {
            setImportingRepoId(null);
        }
    };

    // onSelect handler to track selected folder (ignore files)
    const handleSelect = ({ type, data }) => {
        if (type === 'folder') {
            setSelectedFolder(data);
        }
    };

    const handleClick = () => {
        if (selectedFolder) {
            triggerFolderAction(selectedFolder);
        } else {
            alert("No folder selected.");
        }
    };

    return (
        <div className="p-3">
            <h6>GitHub</h6>
            <button className="btn btn-primary btn-sm" onClick={toggleDropdown}>
                {isOpen ? 'Hide Repos' : 'My Repos'}
            </button>

            {isOpen && (
                <div className="mt-2 border rounded p-2 bg-light">
                    {loading && <div>Loading...</div>}
                    {error && <div className="text-danger">{error}</div>}
                    {!loading && !error && (
                        <ul className="list-unstyled">
                            {repos.map((repo) => (
                                <li
                                    key={repo.id}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {repo.full_name}
                                    </a>
                                    <button
                                        className="btn btn-sm btn-success ms-2"
                                        onClick={() => handleOpenImportModal(repo)}
                                        disabled={importingRepoId === repo.id}
                                    >
                                        {importingRepoId === repo.id ? 'Importing...' : 'Import'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Folder selection modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Select Folder to Import <em>{selectedRepo?.name}</em>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {folderLoading ? (
                        <div>Loading folder tree...</div>
                    ) : folderTree.length > 0 ? (
                        <div>
                            <FileTree
                                data={Array.isArray(folderTree) ? folderTree : [folderTree]}
                                onSelect={handleSelect}
                                onFolderDoubleClick={handleFolderSelect}
                            />
                            <button
                                className="btn btn-success mt-3"
                                onClick={handleClick}
                                disabled={!selectedFolder}
                            >
                                Trigger Folder Action
            

                            </button>
                        </div>
                    ) : (
                        <div>No folders available.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GitHubPanel;






















/*
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import csrfAxios from '../util/csrfAxios';
import FileTree from './FileTree';

function GitHubPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [importingRepoId, setImportingRepoId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [folderTree, setFolderTree] = useState([]); // ✅ local folder tree state
    const [folderLoading, setFolderLoading] = useState(false);

    const toggleDropdown = async () => {
        const nextOpenState = !isOpen;
        setIsOpen(nextOpenState);

        if (nextOpenState && repos.length === 0) {
            setLoading(true);
            setError(null);
            try {
                const response = await csrfAxios.get(`/git/repos/`);
                setRepos(response.data);
            } catch (err) {
                setError('Failed to load repositories.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenImportModal = async (repo) => {
        setSelectedRepo(repo);
        setShowModal(true);

        if (folderTree.length === 0) {
            setFolderLoading(true);
            try {
                const res = await csrfAxios.get('/file-sys/filesystem/');
                console.log("Fetched folder tree for GitHubPanel:", res.data); // DEBUG
                setFolderTree(res.data);
            } catch (err) {
                console.error("Failed to load folder tree:", err);
            } finally {
                setFolderLoading(false);
            }
        }
    };

    const handleFolderSelect = async (selection) => {
        if (selection.type !== 'folder') return;
        const folderId = selection.data.id;

        if (!selectedRepo) return;

        setImportingRepoId(selectedRepo.id);

        try {
            const response = await csrfAxios.post(`/git/repos/import/`, {
                folder_id: folderId,
                repo_owner: selectedRepo.full_name.split('/')[0],
                repo_name: selectedRepo.name,
            });

            alert(`Imported repo into folder ID ${response.data.folder_id}`);
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to import repository.');
        } finally {
            setImportingRepoId(null);
        }
    };

    return (
        <div className="p-3">
            <h6>GitHub</h6>
            <button className="btn btn-primary btn-sm" onClick={toggleDropdown}>
                {isOpen ? 'Hide Repos' : 'My Repos'}
            </button>

            {isOpen && (
                <div className="mt-2 border rounded p-2 bg-light">
                    {loading && <div>Loading...</div>}
                    {error && <div className="text-danger">{error}</div>}
                    {!loading && !error && (
                        <ul className="list-unstyled">
                            {repos.map((repo) => (
                                <li
                                    key={repo.id}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <a
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {repo.full_name}
                                    </a>
                                    <button
                                        className="btn btn-sm btn-success ms-2"
                                        onClick={() => handleOpenImportModal(repo)}
                                        disabled={importingRepoId === repo.id}
                                    >
                                        {importingRepoId === repo.id ? 'Importing...' : 'Import'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Folder selection modal *}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Select Folder to Import <em>{selectedRepo?.name}</em>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {folderLoading ? (
                        <div>Loading folder tree...</div>
                    ) : folderTree.length > 0 ? (
                        <FileTree
                            data={Array.isArray(folderTree) ? folderTree : [folderTree]}
                            onSelect={handleFolderSelect}
                            onFolderDoubleClick={handleFolderSelect}
                        />
                    ) : (
                        <div>No folders available.</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GitHubPanel;
*/

/*

import { useState } from 'react';
import axios from 'axios';
import csrfAxios from "../util/csrfAxios.js";

function GitHubPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const baseUrl = import.meta.env.VITE_SERVER_URL;

    const toggleDropdown = async () => {
        const nextOpenState = !isOpen;
        setIsOpen(nextOpenState);

        if (nextOpenState && repos.length === 0) {
            setLoading(true);
            setError(null);
            try {
                const response = await csrfAxios.get(`/git/repos/`);
                setRepos(response.data); // assumes response.data is an array
            } catch (err) {
                setError('Failed to load repositories.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-3">
            <h6>GitHub</h6>
            <button className="btn btn-primary btn-sm" onClick={toggleDropdown}>
                {isOpen ? 'Hide Repos' : 'My Repos'}
            </button>

            {isOpen && (
                <div className="mt-2 border rounded p-2 bg-light">
                    {loading && <div>Loading...</div>}
                    {error && <div className="text-danger">{error}</div>}
                    {!loading && !error && (
                        <ul className="list-unstyled">
                            {repos.map((repo, idx) => (
                                <li key={idx}>
                                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                        {repo.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default GitHubPanel;


 */