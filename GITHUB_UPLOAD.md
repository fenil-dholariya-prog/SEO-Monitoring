# Uploading This Project To GitHub

Do not upload this project by dragging folders into the GitHub website. This is a Next.js App Router project and it contains required route folders such as:

```text
src/app/api/auth/[...nextauth]
src/app/api/reports/[reportId]
src/app/api/uploads/[...path]
```

GitHub's browser uploader can fail on these folder names and show:

```text
Something went really wrong, and we can't process that file.
```

Use Git from the terminal instead.

## First Upload

From the project folder:

```powershell
git add -A
git status
git commit -m "Initial SEO monthly report generator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub account and repository name.

## If Remote Already Exists

```powershell
git add -A
git status
git commit -m "Update SEO monthly report generator"
git push
```

## Check The API Folder Before Pushing

```powershell
git add --dry-run -- src\app\api
```

You should see:

```text
add 'src/app/api/auth/[...nextauth]/route.ts'
add 'src/app/api/reports/[reportId]/export/docx/route.ts'
add 'src/app/api/reports/[reportId]/export/pdf/route.ts'
add 'src/app/api/uploads/[...path]/route.ts'
```

## Important

Do not commit `.env`, `.next`, `node_modules`, or local uploaded files. The existing `.gitignore` already excludes them.
