import mongoose from "mongoose";

export const ROLE_ACTIVITIES = {
    admin: `1. Create Todo (POST /api/create)
2. Read/Fetch Todos (GET /api/Fetch)
3. Update Todo (PUT /api/update/:id)
4. Delete Todo (DELETE /api/remove/:id)
5. Delete User (POST/DELETE /api/user/delete_user)
6. View All Users (GET /api/user/get_User)
7. View Session Logs (GET /api/user/session_logs)
8. View Activity Logs (GET /api/user/activity_logs)
9. View Roles Based Access (GET /api/user/roles_based_access)
10. Login (POST /api/user/login)
11. Logout (POST /api/user/logout)`,

    user: `1. Read/Fetch Todos (GET /api/Fetch)
2. View All Users (GET /api/user/get_User)
3. View Session Logs (GET /api/user/session_logs)
4. View Activity Logs (GET /api/user/activity_logs)
5. View Roles Based Access (GET /api/user/roles_based_access)
6. Login (POST /api/user/login)
7. Logout (POST /api/user/logout)`
};

export const getRoleActivities = (role) => {
    const normalized = role ? role.toLowerCase() : "user";
    return ROLE_ACTIVITIES[normalized] || ROLE_ACTIVITIES.user;
};

const accessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "admin"]
    },
    can_perform: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Access = mongoose.model("roles_based_access", accessSchema, "roles_based_access");

export default Access;
