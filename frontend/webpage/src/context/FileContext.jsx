import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import csrfAxios from '../util/csrfAxios';

const FileContext = createContext();

export const useFileContext = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
    // Load from localStorage on init (or default)
    const [files, setFiles] = useState(() => {
        const stored = localStorage.getItem('openFiles');
        return stored ? JSON.parse(stored) : [];
    });

    const [pendingChangesMap, setPendingChangesMap] = useState(() => {
        const stored = localStorage.getItem('pendingChanges');
        return stored ? JSON.parse(stored) : {};
    });

    const [showFile, setShowFile] = useState(() => {
        const stored = localStorage.getItem('showFile');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => { // Save pending changes to local storage
        localStorage.setItem('pendingChanges', JSON.stringify(pendingChangesMap));
    }, [pendingChangesMap]);

    // Add file change
    const addPendingChanges = (fileId, changes) => {
        setPendingChangesMap(prev => ({
            ...prev,
            [fileId]: [...(prev[fileId] || []), ...changes],
        }));
    };

    // Save file changes to backend
    const saveFileChanges = async (fileId) => {
        const changes = pendingChangesMap[fileId];
        if (!changes || changes.length === 0) return;

        try {
            await csrfAxios.post(`/file-sys/files/${fileId}/apply-changes/`, {
                changes,
            });

            setPendingChangesMap(prev => {
                const newMap = { ...prev };
                delete newMap[fileId];
                return newMap;
            });

            markFileSaved(fileId);
        } catch (err) {
            console.error('Failed to apply changes:', err);
        }
    };

    const clearPendingChanges = (fileId) => {
        setPendingChangesMap(prev => {
            const newMap = { ...prev };
            delete newMap[fileId];
            return newMap;
        });
    };


    // Sync files to localStorage when they change
    useEffect(() => {
        localStorage.setItem('openFiles', JSON.stringify(files));
    }, [files]);

    useEffect(() => {
        if (showFile) {
            localStorage.setItem('showFile', JSON.stringify(showFile));
        } else {
            localStorage.removeItem('showFile');
        }
    }, [showFile]);

    const addFileById = async (fileId) => {
        try {
            const response = await csrfAxios.get(`/file-sys/files/${fileId}/`);
            const fullFile = {
                ...response.data,
                modified: false, // NEW: track if file has been changed
            };

            setFiles(prevFiles => {
                const alreadyExists = prevFiles.some(f => f.id === fileId);
                return alreadyExists ? prevFiles : [...prevFiles, fullFile];
            });

            setShowFile(fullFile);
        } catch (err) {
            console.error(`Error fetching file ${fileId}:`, err);
        }
    };

    const closeFile = (fileId) => {
        const file = files.find(f => f.id === fileId);

        // NEW: confirm if modified
        if (file?.modified) {
            const confirmClose = window.confirm(
                `You have unsaved changes in "${file.file_name}.${file.extension}". Close without saving?`
            );
            if (!confirmClose) return; // Cancel the close
        }

        setFiles(prevFiles => {
            const newFiles = prevFiles.filter(f => f.id !== fileId);

            if (showFile?.id === fileId) {
                setShowFile(newFiles.length > 0 ? newFiles[0] : null);
            }

            return newFiles;
        });
    };

    const updateFileContent = (fileId, newContent) => {
        setFiles(prev =>
            prev.map(f =>
                f.id === fileId
                    ? {
                        ...f,
                        file_content: newContent,
                        modified: f.file_content !== newContent, // only mark modified if changed
                    }
                    : f
            )
        );

        if (showFile?.id === fileId) {
            setShowFile(prev => ({
                ...prev,
                file_content: newContent,
                modified: prev.file_content !== newContent, // match flag
            }));
        }
    };

    const markFileSaved = (fileId) => {
        setFiles(prev =>
            prev.map(f =>
                f.id === fileId
                    ? { ...f, modified: false }
                    : f
            )
        );

        if (showFile?.id === fileId) {
            setShowFile(prev => ({
                ...prev,
                modified: false,
            }));
        }
    };


    const resetFiles = useCallback(() => {
        setFiles([]);
        setShowFile(null);
        localStorage.removeItem('openFiles');
        localStorage.removeItem('showFile');
    }, []);

    const value = {
        files,
        showFile,
        setShowFile,
        addFileById,
        closeFile,
        updateFileContent,
        markFileSaved,
        saveFileChanges,
        addPendingChanges,
        resetFiles,
        clearPendingChanges,
        pendingChangesMap,
    };

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};
