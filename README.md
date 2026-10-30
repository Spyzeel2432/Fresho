Project: Fresho — Local Farmer Marketplace Frontend

Purpose:
A production-style React + Vite frontend focused on completing the UI/UX before backend integration.

Tech stack
- Frontend: React 18, JavaScript, Vite, React Router, custom CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication and security: JWT, bcryptjs, CORS
- PWA: Web app manifest and service worker
- Deployment configuration: Vercel for frontend, Render for API; MongoDB hosted separately, such as MongoDB Atlas
- Testing artifacts: Python end-to-end test file and a test report are present in the repository

Current routes
Public
- / — Landing
- /roles — Role selection
- /login — Login
- /register — Registration
Customer
- /customer
- /explore
- /product/:id
- /cart
- /checkout
- /orders
- /track
- /wishlist
- /profile
Farmer
- /farmer
- /farmer/products
- /farmer/add
- /farmer/orders
- /farmer/earnings
- /farmer/messages
Administrator
- /admin
- /admin/users
- /admin/farmers
- /admin/products
- /admin/orders
- /admin/report
