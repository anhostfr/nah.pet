# 🐾 Nah.pet – Open Source URL Shortener

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Translation status](https://hosted.weblate.org/widget/nah-pet/paraglide-messages/svg-badge.svg)](https://hosted.weblate.org/engage/nah-pet/)
[![Translation status](https://hosted.weblate.org/widget/nah-pet/language-badge.svg?threshold=0)](https://hosted.weblate.org/engage/nah-pet/)

> **Nah.pet** – _"Rewriting paths with bad energy"_ ✨  
> Open-source URL shortener with custom domains and analytics.

📚 **[OpenAPI Documentation](https://nah.pet/doc)**

---

## ✨ Features

- ✂️ **URL Shortening** with custom slugs
- 🔐 **Password protection** for sensitive links
- ⏰ **Automatic link expiration**
- 📊 **Detailed analytics** (clicks, geolocation, browsers)
- 🌐 **Custom domains** with complete isolation
- 👥 **Admin system** with manual approval
- 🔑 **REST API** with API key authentication
- 🌍 **Multilingual interface**

---

## 🌍 Translation Status

[![Translation status](https://hosted.weblate.org/widget/nah-pet/paraglide-messages/svg-badge.svg)](https://hosted.weblate.org/engage/nah-pet/)
[![Translation status](https://hosted.weblate.org/widget/nah-pet/language-badge.svg?threshold=0)](https://hosted.weblate.org/engage/nah-pet/)

[![Translation status](https://hosted.weblate.org/widget/nah-pet/multi-auto.svg?threshold=0)](https://hosted.weblate.org/engage/nah-pet/)

_Managed with Paraglide JS and Weblate for type-safety._

---

## 🌐 Custom Domains

### Why `cat.yourDomain.tld`?

The `cat.` prefix bypasses CORS restrictions from Cloudflare and other CDNs by using a dedicated subdomain.

### DNS Setup

1. **Domain verification**:
   - DNS: TXT record with token
   - File: `/.well-known/nah-pet-verification.txt`

2. **CNAME configuration**:
   ```dns
   Type: CNAME
   Name: cat.example.com
   Value: cat.nah.pet
   TTL: 300
   ```
3. **Redirection**:

   ```
   https://cat.example.com/abc123 → CNAME → cat.nah.pet → nah.pet
   ```

> Each custom domain is fully isolated—no access to system routes (`/admin`, `/login`, etc.).

---

## 🚀 Installation

### 🐳 Docker Compose

```bash
git clone https://github.com/anhostfr/nah.pet
cd link-shortener

cp .env.example .env
# Edit variables
# DATABASE_URL=postgresql://user:password@postgres:5432/nahpet
# PUBLIC_MAIN_DOMAIN=your-domain.com
# ADMIN_EMAIL=admin@example.com
# OAUTH_CLIENT_ID=your_oauth_id (optional)
# OAUTH_CLIENT_SECRET=your_oauth_secret (optional)

docker-compose up -d
```

Access:

- Web interface: `http://localhost:3000`
- API: `http://localhost:3000/doc`

### 🛠️ Manual Installation

```bash
bun install
createdb nahpet
cp .env.example .env  # Edit variables
bunx prisma migrate deploy
bun run dev
```

---

## 🔌 REST API

Built with **sveltekit-api** from [JacobLinCool](https://github.com/JacobLinCool), OpenAPI 3.0 specification.

### Main Endpoints

- `GET /api/v1/links` – List links
- `POST /api/v1/links` – Create a link
- `GET/PUT/DELETE /api/v1/links/{id}` – Manage a link
- `GET /api/v1/stats` – Global statistics
- `GET /api/v1/stats/{slug}` – Link statistics
- `POST /api/v1/links/bulk` – Bulk operations
- `GET /api/v1/stats/export` – Export data

### SDK Generation

```bash
npm install @openapitools/openapi-generator-cli -g

curl -o openapi.json https://your-domain.com/api/v1/openapi.json

openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./sdk-typescript
```

### Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://your-domain.com/api/v1/links"
```

---

## 🏗️ Tech Stack

- **Frontend/Backend**: SvelteKit 5 + TypeScript
- **Runtime**: Bun 1.x
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Lucia Auth + OAuth2
- **Styling**: TailwindCSS 4 + Shadcn/ui
- **i18n**: Paraglide JS
- **API**: Sveltekit-api (OpenAPI)
- **Deployment**: Docker + Docker Compose

### Project Structure

```
src/
├── routes/          # Pages and API
├── lib/
│   ├── components/  # Svelte components
│   ├── server/      # Server logic
│   └── paraglide/   # Translations
└── api/v1/           # API definitions
```

---

## 🛠️ Development

```bash
bun run dev        # Development
bun run build      # Production
bun run check      # TypeScript check
bun run format     # Prettier formatting

bunx prisma studio
bunx prisma generate
bunx prisma migrate dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nahpet
PUBLIC_MAIN_DOMAIN=localhost:5173
ADMIN_EMAIL=admin@example.com
OAUTH_CLIENT_ID=your_oauth_client_id (optional)
OAUTH_CLIENT_SECRET=your_oauth_client_secret (optional)
```

---

### Screenshots

<table>
  <tr>
    <td align="center">
      <img src="static/screenshots-demo/dashboard.png" alt="Dashboard Screenshot" width="300"/><br/>
      <sub>Dashboard</sub>
    </td>
    <td align="center">
      <img src="static/screenshots-demo/analytics.png" alt="Analytics Screenshot" width="300"/><br/>
      <sub>Analytics</sub>
    </td>
    <td align="center">
      <img src="static/screenshots-demo/analytics-slug.png" alt="Analytics Slug Screenshot" width="300"/><br/>
      <sub>Analytics (Slug)</sub>
    </td>
  </tr>
</table>


## 🤝 Contributing

### Translations

```bash
cp messages/en.json messages/es.json  # Add Spanish
# Add "es" in project.inlang/settings.json
```

### Code

1. Fork the repository
2. Create a branch `feature/my-feature`
3. Develop with `bun run dev`
4. Check with `bun run check` + `bun run format`
5. Open a Pull Request

---

## 📄 License

MIT – see [LICENSE](LICENSE)

---

## 🙏 Acknowledgements

- [SvelteKit](https://kit.svelte.dev/)
- [sveltekit-api](https://github.com/JacobLinCool/sveltekit-api)
- [Prisma](https://prisma.io/)
- [Lucia Auth](https://lucia-auth.com/)
- [Paraglide JS](https://inlang.com/)
- [Bun](https://bun.sh/)

---

<div align="center">
    <em>"It's a no from us, dawg." – but it's a yes for open source!</em>
</div>
