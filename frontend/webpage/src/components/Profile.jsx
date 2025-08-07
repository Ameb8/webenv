import { useAuth } from '../context/AuthContext';
import { useColor } from '../context/ColorContext';
import { Button, Stack } from 'react-bootstrap';

function Profile() {
    const { logout } = useAuth();
    const { scheme, toggleScheme } = useColor();
    const isDark = scheme === 'dark';

    return (
        <div className={`p-3 rounded-3 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <h6 className="mb-3">Account Settings</h6>

            <Stack gap={2}>
                <Button variant={isDark ? 'primary' : 'dark'} size="sm">
                    Profile
                </Button>

                <Button variant="outline-danger" size="sm" onClick={logout}>
                    Log Out
                </Button>

                <hr className={`my-2 ${isDark ? 'border-light' : 'border-dark'}`} />

                <Button
                    variant={isDark ? 'outline-light' : 'outline-dark'}
                    size="sm"
                    onClick={toggleScheme}
                >
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
            </Stack>
        </div>
    );
}

export default Profile;
