export type ProfileSettingsValues = {
  avatarUrl: string | null;
  name: string;
  bio: string;
  twitterLink: string;
  streamerMode: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchProfile(jwt: string): Promise<ProfileSettingsValues> {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }

  return res.json() as Promise<ProfileSettingsValues>;
}

export async function updateProfile(
  jwt: string,
  data: ProfileSettingsValues,
): Promise<ProfileSettingsValues> {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to update profile: ${res.status}`);
  }

  return res.json() as Promise<ProfileSettingsValues>;
}
