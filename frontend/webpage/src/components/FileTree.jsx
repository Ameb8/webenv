import { useState } from 'react';
import { Collapse } from 'react-bootstrap'
import { useFileContext } from '../context/FileContext';

function FileTree({ data, onSelect, onFolderDoubleClick }) {
    return (
        <div>
            {data.map((folder) => (
                <FolderNode
                    key={folder.id}
                    folder={folder}
                    onSelect={onSelect}
                    onFolderDoubleClick={onFolderDoubleClick}
                />
            ))}
        </div>
    );
}

function FolderNode({ folder, onSelect, onFolderDoubleClick }) {
    const [open, setOpen] = useState(false);

    // Select when clicked
    const handleClick = () => {
        setOpen(!open);
        onSelect({ type: 'folder', data: folder });
    };

    // Create file or subfolder when double-clicked
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (onFolderDoubleClick) {
            onFolderDoubleClick(folder);
        }
    };

    return (
        <div className="ms-2">
            <div
                role="button"
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                className="fw-bold"
            >
                📁 {folder.folder_name}
            </div>
            <Collapse in={open}>
                <div>
                    {folder.subfolders.map((sub) => (
                        <FolderNode
                            key={sub.id}
                            folder={sub}
                            onSelect={onSelect}
                            onFolderDoubleClick={onFolderDoubleClick}
                        />
                    ))}
                    {folder.files.map((file) => (
                        <FileNode key={file.id} file={file} onSelect={onSelect} />
                    ))}
                </div>
            </Collapse>
        </div>
    );
}

function FileNode({ file, onSelect }) {
    const { addFileById } = useFileContext();

    const handleDoubleClick = () => {
        addFileById(file.id);
    };

    return (
        <div
            className="ms-4"
            role="button"
            onClick={() => onSelect({ type: 'file', data: file })}
            onDoubleClick={handleDoubleClick}
        >
            📄 {file.file_name}.{file.extension}
        </div>
    );
}

export default FileTree;
