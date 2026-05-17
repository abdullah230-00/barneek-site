# Secure Deployment Files List

## ✅ Essential Files TO UPLOAD (Source → pnpm build → /dist)

```
package.json
pnpm-lock.yaml
Dockerfile
nginx.conf
vite.config.ts
tsconfig*.json
postcss.config.mjs
index.html
public/
src/
```

**Prod Flow**:
```
1. pnpm ci
2. pnpm build
3. docker build . -t app-prod
4. Upload /dist + nginx.conf OR docker push
```

## 🚫 NEVER Upload (Security/Dev)

```
node_modules/
dist/ (generate locally)
docker-compose.yml (dev URLs)
supabase/functions/ (separate deploy)
TODO.md
package-lock.json
README*.md
guidelines/
.env*
.git/
```

**Security Notes**:
- Rotate Supabase anon key post-deploy.
- Enable RLS on all Supabase tables.
- CSP headers in nginx.conf.
- No service_role keys in client code ✅

**Verification**:
\`\`\`bash
pnpm audit
pnpm build
docker build .
\`\`\`

