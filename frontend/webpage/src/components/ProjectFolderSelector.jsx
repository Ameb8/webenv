import { useState, useEffect } from 'react';
import FileTree from './FileTree';
import { useProjectContext } from '../context/ProjectContext';
import csrfAxios from '../util/csrfAxios';  // or wherever your axios util is


function ProjectFolderSelector() {
    const [fileTree, setFileTree] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const { setRootFolderId } = useProjectContext();

    // Fetch fileTree once when component mounts
    useEffect(() => {
        console.log("file-sys/filesystem called from ProjectFolderSelector.jsx") // DEBUG ***

        csrfAxios.get('file-sys/filesystem/')
            .then(res => {
                console.log("file-sys/filesystem API response (ProjectFolderSelector):", res.data); // DEBUG *****
                setFileTree(res.data);
            })
            .catch(err => console.error(err));
    }, []);

    // onSelect handler to track selected folder (ignore files)
    const handleSelect = ({ type, data }) => {
        if (type === 'folder') {
            setSelectedFolder(data);
        }
    };


    const handleOpenProject = () => {
        console.log("ProjectFolderSelector:")
        console.log(selectedFolder);
        if (selectedFolder) {
            setRootFolderId(selectedFolder.id);
        } else {
            alert('Please select a folder first.');
        }
    };

    return (
        <div className="p-3 d-flex flex-column" style={{ height: '100%' }}>
            <h6>Select Project Folder</h6>
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <FileTree
                    data={fileTree}
                    onSelect={handleSelect}
                />
            </div>
            <button
                className="btn btn-primary mt-3"
                onClick={handleOpenProject}
                disabled={!selectedFolder}
            >
                Open Project
            </button>
        </div>
    );
}

export default ProjectFolderSelector;
