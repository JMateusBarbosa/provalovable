export type BackendProvider = 'supabase' | 'nhost';

const SUPPORTED_PROVIDERS: BackendProvider[] = ['supabase', 'nhost'];

const providerFromEnv = (import.meta.env.VITE_BACKEND_PROVIDER ?? 'supabase').toLowerCase();

export const backendProvider: BackendProvider = SUPPORTED_PROVIDERS.includes(providerFromEnv as BackendProvider)
  ? (providerFromEnv as BackendProvider)
  : 'supabase';

const requireEnv = (key: string): string => {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  return value;
};

export const getSupabaseConfig = () => {
  const url = requireEnv('VITE_SUPABASE_URL');
  const key = requireEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

  return { url, key };
};

export const getNhostConfig = () => {
  const subdomain = requireEnv('VITE_NHOST_SUBDOMAIN');
  const region = requireEnv('VITE_NHOST_REGION');

  const base = `${subdomain}.${region}.nhost.run`;

  return {
    subdomain,
    region,
    authUrl: `https://${subdomain}.auth.${region}.nhost.run/v1`,
    graphqlUrl: `https://${subdomain}.graphql.${region}.nhost.run/v1`,
    storageUrl: `https://${subdomain}.storage.${region}.nhost.run/v1`,
    hasuraConsoleUrl: `https://${base}`,
  };
};
