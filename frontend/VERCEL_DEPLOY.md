Vercel deployment notes

To deploy this frontend on Vercel:

1. In Vercel, create a new project and link your GitHub repository `Vijayendramurthy/housie`.
2. Set the project root to `frontend` when prompted (so Vercel runs npm install/build in that folder).
3. Add the environment variable in Vercel's dashboard:
   - Key: REACT_APP_API_URL
   - Value: https://housiegame-3xwy.onrender.com
4. Build settings (Vercel usually detects Create React App):
   - Framework: Create React App
   - Build command: npm run build
   - Output directory: build
5. Deploy — Vercel will build and host the static frontend.

Local testing:

Set the env locally and start dev server:

```powershell
$env:REACT_APP_API_URL='https://housiegame-3xwy.onrender.com'
npm start
```

Or for a production build:

```powershell
$env:REACT_APP_API_URL='https://housiegame-3xwy.onrender.com'
npm run build
# serve the build with a static server
npx serve -s build
```
