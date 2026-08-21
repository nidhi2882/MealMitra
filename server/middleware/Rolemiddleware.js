// // Usage: router.get("/admin/users", protect, authorize("Admin"), getAllUsers)
// // Must run AFTER `protect`, since it relies on req.user being set.
// const authorize = (...allowedRoles) => {
//     return (req, res, next) => {
//         if (!req.user || !allowedRoles.includes(req.user.role)) {
//             return res.status(403).json({
//                 message: `Access denied. This action requires role: ${allowedRoles.join(" or ")}.`,
//             });
//         }
//         next();
//     };
// };
//
// module.exports = { authorize };