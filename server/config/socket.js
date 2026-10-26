/**
 * Socket.IO Configuration & Event Emitter Helper for MealMitra
 * 
 * Provides centralized real-time WebSocket communication.
 * Enables instant multi-user synchronization without manual page refreshes.
 */

const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // allow all origins or configured frontend URL
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        // Client joins their personal room based on user ID for targeted alerts
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId.toString());
            }
        });

        // Client leaves room on logout/disconnect
        socket.on("leave", (userId) => {
            if (userId) {
                socket.leave(userId.toString());
            }
        });

        socket.on("disconnect", () => {
            // connection cleaned up automatically by socket.io
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized. Call initSocket(server) first.");
    }
    return io;
};

/**
 * Emit event to all connected clients (e.g., when a new donation is created)
 */
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

/**
 * Emit event to a specific user's room (e.g., direct notification or incoming request)
 */
const emitToUser = (userId, event, data) => {
    if (io && userId) {
        io.to(userId.toString()).emit(event, data);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitToAll,
    emitToUser,
};
