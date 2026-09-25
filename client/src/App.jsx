import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background font-sans">
                <Navbar />
                <main>
                    <AppRoutes />
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;