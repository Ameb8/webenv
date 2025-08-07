import { useEffect } from 'react';
import { useFileContext } from '../context/FileContext';
import csrfAxios from '../util/csrfAxios';

function SaveShortcut() {
    const {
        showFile,
        files,
        markFileSaved,
        saveFileChanges,
        pendingChangesMap,
    } = useFileContext();

    useEffect(() => {
        const handleKeyDown = async (e) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const isSave = e.key === 's' && (isMac ? e.metaKey : e.ctrlKey);

            if (!isSave) return;

            e.preventDefault();

            if (e.shiftKey) {
                // Save All (Cmd/Ctrl + Shift + S)
                try {
                    await Promise.all(
                        files.map(file =>
                            saveFileChanges(file.id) // Use diff-based saving
                        )
                    );
                } catch (err) {
                    console.error('Failed to save all files:', err);
                }
            } else {
                // Save Current (Cmd/Ctrl + S)
                if (!showFile?.id) return;
                try {
                    await saveFileChanges(showFile.id);
                } catch (err) {
                    console.error('Failed to save file:', err);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showFile, files, saveFileChanges]);

    return null;
}

export default SaveShortcut;


/*
function SaveShortcut() {
    const { showFile, files, markFileSaved } = useFileContext();

    useEffect(() => {
        const handleKeyDown = async (e) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const isSave = e.key === 's' && (isMac ? e.metaKey : e.ctrlKey);

            if (isSave) {
                e.preventDefault();

                if (e.shiftKey) { // CMD + Shift + S or CTRL + Shift + S => Save All
                    try {
                        await Promise.all(files.map(file => // Save all  files
                            csrfAxios.patch(`/file-sys/files/${file.id}/`, {
                                file_content: file.file_content,
                            })
                        ));

                        markFileSaved(showFile.id); // Mark file as saved
                    } catch (err) { // Save Error
                        console.error('Failed to save all files:', err);
                    }
                } else { // CMD + S or CTRL + S => Save Current
                    if (!showFile?.id) // No open file
                        return;
                    try { // Save  open file
                        await csrfAxios.patch(`/file-sys/files/${showFile.id}/`, {
                            file_content: showFile.file_content,
                        });

                        markFileSaved(showFile.id); // Mark file as saved
                    } catch (err) { // Save Error
                        console.error('Failed to save file:', err);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showFile, files]);

    return null;
}

export default SaveShortcut;
*/