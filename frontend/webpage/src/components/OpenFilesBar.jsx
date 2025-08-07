import { useFileContext } from '../context/FileContext';
import { useColor } from '../context/ColorContext';
import { Nav, Button } from 'react-bootstrap';

function OpenFilesBar() {
    const { files, showFile, setShowFile, closeFile } = useFileContext();
    const { scheme } = useColor();

    const isDark = scheme === 'dark';

    const barClass = isDark
        ? 'bg-dark border-bottom border-secondary'
        : 'bg-light border-bottom border-muted';

    const linkClass = isDark
        ? 'text-light'
        : 'text-dark';

    return (
        <Nav variant="tabs" className={`px-2 py-1 ${barClass}`} style={{ gap: '0.5rem' }}>
            {files.map(file => {
                const isActive = showFile?.id === file.id;

                return (
                    <Nav.Item key={file.id} className="d-flex align-items-center">
                        <Nav.Link
                            href="#"
                            onClick={() => setShowFile(file)}
                            active={isActive}
                            className={`px-2 py-1 rounded ${linkClass} d-flex align-items-center`}
                            style={{
                                backgroundColor: isActive
                                    ? (isDark ? '#3d3d3d' : '#e9ecef')
                                    : (isDark ? '#2b2b2b' : '#f8f9fa'),
                                border: isDark ? '1px solid #444' : '1px solid #ddd',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                gap: '0.5rem',
                                maxWidth: '200px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            <span className="text-truncate">
                                {file.file_name}.{file.extension}
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="p-0 ps-1 text-muted"
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent Nav.Link from being triggered
                                    closeFile(file.id);
                                }}
                                title="Close"
                            >
                                ×
                            </Button>
                        </Nav.Link>
                    </Nav.Item>
                );
            })}
        </Nav>
    );
}

export default OpenFilesBar;
