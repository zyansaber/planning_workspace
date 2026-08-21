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
