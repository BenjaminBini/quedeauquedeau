# GitHub Pages Deployment Guide

## ✅ Files Ready for Deployment

The website has been migrated to **React with HeroUI** and files are ready in the `/docs` folder:
- `docs/index.html` - Main entry point
- `docs/assets/` - Compiled JavaScript and CSS bundles
- `docs/trumpactions.db` - SQLite database (733KB)
- Built with React, HeroUI (formerly NextUI), and Tailwind CSS
- Fully client-side, no server required

## 🚀 Enable GitHub Pages

To deploy the website, you need to enable GitHub Pages in your repository settings:

### Steps:

1. **Go to your repository on GitHub:**
   ```
   https://github.com/BenjaminBini/quedeauquedeau
   ```

2. **Navigate to Settings:**
   - Click on the "Settings" tab (top right of the repository page)

3. **Go to Pages:**
   - In the left sidebar, scroll down and click "Pages"

4. **Configure the source:**
   - Under "Build and deployment" → "Source"
   - Select **"Deploy from a branch"**

5. **Select the branch and folder:**
   - Branch: `claude/migrate-ton-use-011CUta4JhCFdF8LVdYarLvb` (or your main branch)
   - Folder: `/docs`
   - Click **Save**

6. **Wait for deployment:**
   - GitHub will automatically build and deploy your site
   - This usually takes 1-2 minutes

7. **Access your site:**
   - Once deployed, your site will be available at:
   ```
   https://benjaminbini.github.io/quedeauquedeau/
   ```
   - The exact URL will be shown in the Pages settings

## 🔄 Alternative Deployment Option

If you want to use the standard `gh-pages` branch:

1. **Merge the feature branch to main** (or your default branch)
2. **Then manually create a gh-pages branch:**
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```
3. **Configure GitHub Pages to use the `gh-pages` branch**

## 📝 What's Deployed

Once enabled, visitors can:
- ✅ View dashboard with statistics
- ✅ Browse 1,669 documented actions
- ✅ Filter by 10 threat categories
- ✅ Search actions by keyword
- ✅ View timeline of events
- ✅ Explore category-grouped actions

## 🔍 Verify Deployment

After enabling GitHub Pages, check:

1. **GitHub Actions tab** - Should show a "pages build and deployment" workflow
2. **Settings → Pages** - Should show "Your site is live at..."
3. **Visit the URL** - Website should load with all functionality

## 🐛 Troubleshooting

**Site not loading?**
- Wait 2-3 minutes after enabling Pages
- Check that the branch and folder are correctly selected
- Verify the build was successful (`npm run build`)

**404 error?**
- Verify the branch name is correct in Settings
- Check that `/docs` folder is selected, not root `/`
- Ensure `vite.config.js` has `base: './'` for relative paths

**Data not loading?**
- Open browser console (F12) to check for errors
- Verify `trumpactions.db` is in the docs folder (733KB file)
- Check browser compatibility (modern browsers required for WebAssembly)

## 📧 Need Help?

If you encounter issues:
1. Check the GitHub Actions logs for error messages
2. Verify all files are present in the `/docs` folder
3. Try deploying from the main branch instead

## 🔧 Rebuilding and Deploying Updates

When you make changes to the source code:

1. **Rebuild the application:**
   ```bash
   npm run build
   ```

2. **Ensure the database is in the public folder:**
   ```bash
   cp trumpactions.db public/
   ```

3. **Update the docs folder:**
   ```bash
   rm -rf docs/* && cp -r dist/* docs/
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update deployment"
   git push
   ```

---

**Current Branch:** `claude/migrate-ton-use-011CUta4JhCFdF8LVdYarLvb`
**Technology:** React 18 + HeroUI + Vite
**Files Location:** `/docs` folder
**Ready to Deploy:** ✅ Yes
