# Ignidash Startup and Shutdown Cheat Sheet

This cheat sheet provides the steps to properly start and shut down your Ignidash application, whether you're working on your **personal branch** or testing other branches.

---

## **Startup Instructions**

### **1. Switch to the Correct Branch**
- For your personal application:
  ```bash
  git checkout personal
  ```
- For testing other branches (e.g., `main` or `feature/my-enhancement`):
  ```bash
  git checkout <branch-name>
  ```

### **2. Start Docker Containers**
- Build the Docker containers (only needed if there are changes):
  ```bash
  npm run docker:build
  ```
- Start the containers:
  ```bash
  npm run docker:up
  ```
- Check logs (optional):
  ```bash
  npm run docker:logs
  ```

### **3. Access the Application**
- Open your browser and go to:
  [http://localhost:3000](http://localhost:3000)

### **4. Sync Environment Variables (if needed)**
- If you updated `.env.local`, sync the variables to Convex:
  ```bash
  npm run selfhost -- --sync-only
  ```

### **5. Deploy Convex Functions (if needed)**
- If you updated Convex backend functions, deploy them:
  ```bash
  npm run selfhost:convex-deploy
  ```

---

## **Shutdown Instructions**

### **1. Stop Docker Containers**
- To stop the running containers:
  ```bash
  npm run docker:down
  ```

### **2. Clean Up (Optional)**
- If you want to remove all Docker containers and images:
  ```bash
  docker system prune -af
  ```

---

## **Common Commands Summary**

| Command                          | Description                              |
|----------------------------------|------------------------------------------|
| `git checkout <branch-name>`     | Switch to the desired branch             |
| `npm run docker:build`           | Build Docker containers                  |
| `npm run docker:up`              | Start Docker containers                  |
| `npm run docker:logs`            | View logs for running containers         |
| `npm run docker:down`            | Stop Docker containers                   |
| `npm run selfhost -- --sync-only`| Sync `.env.local` to Convex backend      |
| `npm run selfhost:convex-deploy` | Deploy Convex functions                  |

---

Use this cheat sheet as a quick reference to ensure your Ignidash application is started and shut down properly.