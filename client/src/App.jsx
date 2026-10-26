import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/common/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <div className="min-h-screen bg-background font-sans">
                    <Navbar />
                    <main>
                        <AppRoutes />
                    </main>
                </div>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;