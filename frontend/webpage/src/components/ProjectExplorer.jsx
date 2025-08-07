import { useEffect, useState } from 'react';
import csrfAxios from "../util/csrfAxios.js";
import FileTree from './FileTree';
import NewFileModal from './NewFileModal';
import { useProjectContext } from '../context/ProjectContext';

function ProjectExplorer({ onSelectItem }) {
    const [fileTree, setFileTree] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeFolderId, setActiveFolderId] = useState(null);
    const { rootFolderId } = useProjectContext();

    useEffect(() => {
        console.log("file-sys/filesystem called from ProjectExplorer.jsx") // DEBUG *****

        if (rootFolderId !== null) {
            csrfAxios.get(`file-sys/filesystem/${rootFolderId}/`)
                .then(res => {
                    console.log("file-sys/filesystem API response (ProjectExplorer):", res.data); // DEBUG *****
                    setFileTree([res.data]);
                })
                .catch(err => console.error(err));
            }
    }, [rootFolderId]);

    const handleFolderDoubleClick = (folder) => {
        setActiveFolderId(folder.id);
        setShowModal(true);
    };

    return (
        <div className="p-3">
            <h6>Project Explorer</h6>
            <FileTree
                data={fileTree}
                onSelect={onSelectItem}
                onFolderDoubleClick={handleFolderDoubleClick}
            />
            <NewFileModal
                show={showModal}
                onHide={() => setShowModal(false)}
                folderId={activeFolderId}
                onFileCreated={(file) => {
                    // optional: re-fetch tree or notify user
                    console.log("File created:", file);
                }}
            />
        </div>
    );
}

export default ProjectExplorer;
