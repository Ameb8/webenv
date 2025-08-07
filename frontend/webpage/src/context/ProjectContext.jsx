import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useFileContext } from './FileContext'; // Adjust path if needed

const ProjectContext = createContext();

export const useProjectContext = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    const [rootFolderId, setRootFolderId] = useState(() => {
        const stored = localStorage.getItem('rootFolderId');
        return stored ? parseInt(stored) : null;
    });

    const { resetFiles } = useFileContext();

    // Ref to skip calling resetFiles on first render
    const initialMount = useRef(true);

    // Effect to call resetFiles when rootFolderId changes (not on first mount)
    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }

        // Whenever rootFolderId changes, reset files in FileContext
        resetFiles();

    }, [rootFolderId, resetFiles]);

    // Save rootFolderId in localStorage
    useEffect(() => {
        if (rootFolderId !== null) {
            console.log("New folder selected");
            console.log(rootFolderId);
            localStorage.setItem('rootFolderId', rootFolderId);
        } else {
            localStorage.removeItem('rootFolderId');
        }
    }, [rootFolderId]);

    return (
        <ProjectContext.Provider value={{ rootFolderId, setRootFolderId }}>
            {children}
        </ProjectContext.Provider>
    );
};
