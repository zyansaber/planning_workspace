# Shadcn-UI Template Usage Instructions

## technology stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Microsoft sign-in

The application uses Firebase Authentication's Microsoft provider and only
accepts accounts whose email address ends in `@regentrv.com.au`.

Each Firebase session is limited to 24 hours from its signed authentication
time. When that period expires, an open page signs the user out and the next
visit requires a fresh Microsoft login. The Microsoft OAuth request uses
`prompt=login` so a newly started Firebase session cannot silently reuse the
existing Microsoft browser session.

1. In **Microsoft Entra admin center → App registrations**, create an app for
   the Regent RV tenant. Copy its **Application (client) ID** and **Directory
   (tenant) ID**.
2. Under the Entra app's **Authentication → Web → Redirect URIs**, add
   `https://planningworkspace.firebaseapp.com/__/auth/handler`. If Firebase
   Authentication uses a custom auth domain, add that domain's `/__/auth/handler`
   URL instead.
3. Under **Certificates & secrets**, create a client secret and immediately copy
   the secret **Value** (not the Secret ID).
4. Open the `planningworkspace` project in **Firebase Console → Build →
   Authentication → Sign-in method → Add new provider → Microsoft**. Enter the
   Entra application ID and client-secret value, switch the provider to
   **Enabled**, and press **Save**.
5. In **Firebase Authentication → Settings → Authorized domains**, add every
   hostname that serves the app (for example the production Render hostname).
   `localhost` must also be present when testing locally.
6. Set `VITE_MICROSOFT_TENANT_ID` to the Directory (tenant) ID in the local
   `.env` file and in the production build environment, then rebuild/redeploy:

   ```dotenv
   VITE_MICROSOFT_TENANT_ID=00000000-0000-0000-0000-000000000000
   ```

`VITE_MICROSOFT_TENANT_ID` is the **Directory (tenant) ID** of the Microsoft
Entra organization that owns `regentrv.com.au`. It is a UUID in the format
shown above; the sample zero value is only a placeholder and must not be used.
It is not the company domain, Application (client) ID, Firebase project ID, or
client secret.

To find the real value, sign in to the Microsoft Entra admin center using a
Regent RV administrator account, open **Identity → Overview**, and copy
**Tenant ID**. The same value is also shown as **Directory (tenant) ID** under
**App registrations → the app registration → Overview**. Paste it into the
Render environment variable without quotes or extra spaces, then rebuild the
site. If you do not have permission to view it, ask the Regent RV Microsoft 365
or Entra administrator for the **Directory (tenant) ID**; it cannot be derived
reliably from this repository.

### Finding the two Microsoft IDs

Both IDs are displayed together on the Entra app registration's Overview page:

1. Sign in at `https://entra.microsoft.com` with a Regent RV administrator
   account.
2. Open **Identity → Applications → App registrations → All applications**.
3. Select the app registration created for this workspace. If none exists,
   select **New registration**, create one in the Regent RV directory, and then
   open it.
4. On **Overview**, copy the values from the **Essentials** section:

   | Entra label | Example format | Where it is used |
   | --- | --- | --- |
   | **Application (client) ID** | `11111111-...` | Firebase Console's Microsoft provider **Application ID** field |
   | **Directory (tenant) ID** | `22222222-...` | Render's `VITE_MICROSOFT_TENANT_ID` value |

Do not use **Object ID** for either setting. The two required IDs are normally
different UUIDs. The **Application (client) ID** identifies this particular app
registration; the **Directory (tenant) ID** identifies the Regent RV Microsoft
organization. In the Azure portal, the equivalent path is **Microsoft Entra ID
→ App registrations → the app → Overview**.

Do not commit the real tenant-specific deployment configuration into source
control. Although a tenant ID is an identifier rather than a password, keeping
deployment configuration in Render makes it easy to change per environment.

### `auth/configuration-not-found`

This error means the Firebase project used by the web app does not currently
have a usable Microsoft sign-in configuration. Complete step 4 above and check
that:

- the provider says **Enabled** after the page is refreshed;
- the Entra **Application (client) ID** was used, not the tenant ID;
- the client secret **Value** was pasted, not its Secret ID; and
- the configuration was added to the `planningworkspace` Firebase project,
  which is the project configured in `src/lib/firebase.ts`.

Changing `VITE_MICROSOFT_TENANT_ID` alone cannot enable the provider. The
Microsoft provider must first be configured and saved in Firebase Console.

If the error still appears, use this exact checklist:

1. Open `https://console.firebase.google.com/project/planningworkspace/authentication/providers`.
   The project name at the top must be **planningworkspace**. Configuring a
   different Firebase project will not affect this app.
2. If Firebase shows **Get started** instead of the provider list, click it
   first so that Authentication is initialized for this project.
3. Open **Microsoft** under **Sign-in method**. Confirm its status is
   **Enabled**, both fields are populated, and press **Save** again.
4. In the Microsoft Entra app, create a new client secret if the old one has
   expired. Firebase needs the secret's **Value** shown only at creation time;
   the Secret ID will not work.
5. Confirm the Client ID in Firebase is the **Application (client) ID** from the
   same Entra app that contains the Firebase callback URL.
6. Test again in a private browser window after saving. A Render rebuild is not
   required when only the Firebase provider settings change.

Do **not** put the Entra client secret in Render or in a `VITE_*` variable.
`VITE_*` values are included in public browser JavaScript. The client secret
belongs only in Firebase Console; Render only needs the tenant ID.

### Deploying the frontend on Render

Render and Firebase have separate responsibilities in this application:

- **Render** serves the compiled React application.
- **Firebase Authentication** performs Microsoft sign-in.
- **Firebase Realtime Database** stores the workspace data.

Using Render does not cause `auth/configuration-not-found`, and keeping the data
in Firebase is expected. That error comes from the Microsoft provider not being
enabled or completely saved in the `planningworkspace` Firebase project.

For a Render deployment:

1. Copy the hostname from the Render service URL, without `https://` or a path
   (for example `fancy-workspace.onrender.com`).
2. Add that hostname in **Firebase Console → Authentication → Settings →
   Authorized domains**. Do not add the complete URL.
3. In **Render Dashboard → the static site → Environment**, create
   `VITE_MICROSOFT_TENANT_ID` with the Entra Directory (tenant) ID as its value.
4. Trigger **Manual Deploy → Clear build cache & deploy** because Vite embeds
   `VITE_*` values at build time.

The Entra redirect URI normally remains
`https://planningworkspace.firebaseapp.com/__/auth/handler`; it is not the
Render site URL. This is because the Firebase configuration uses
`planningworkspace.firebaseapp.com` as its authentication domain. Only use a
Render URL as an Entra redirect URI if the Firebase `authDomain` itself has
explicitly been changed to a correctly configured custom domain.

The repository's `render.yaml` declares `VITE_MICROSOFT_TENANT_ID` as a secret
environment value for new Blueprint deployments. Existing Render services must
still add it through the Render dashboard.

The browser-side domain check controls the interface. Firebase Realtime
Database Security Rules must also require authentication (and, if applicable,
validate the Microsoft tenant/email claims) so data cannot be accessed by
bypassing the interface.

## Note

The `@/` path alias points to the `src/` directory

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```

## Single-page application deployment

This project is a Vite-powered single-page application. Client-side pages such
as `/#/admin`, `/#/embed/:id`, and `/#/nested/:id` are handled by React Router
rather than by files on the web server. The application deliberately uses hash
routing so refreshing a section always requests the real `/index.html` file,
even when the deployment platform ignores SPA rewrite configuration.

### Deployment

Run `pnpm build` to create the production bundle in `dist`.

Hash routes do not require server-side rewrites. The part after `#` stays in the
browser and is never sent to the static server. The repository also includes
the following fallbacks for old, non-hash links and hosting compatibility:

- `render.yaml` configures the rewrite for Render.
- `public/_redirects` configures compatible static hosts such as Netlify.
- The `postbuild` script creates `dist/404.html` as a fallback for static hosts
  that serve a custom 404 document but do not support rewrite rules.

When deploying an existing Render service that was not created from the
blueprint, add a rewrite in the Render dashboard from `/*` to `/index.html`.
