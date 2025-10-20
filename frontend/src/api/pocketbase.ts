import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_API_URL);

let user: PocketBase['authStore']['model'] | null = pb.authStore.model;

pb.authStore.onChange(() => {
  if (user !== null) {
    user.value = pb.authStore.model;
  } else {
    user = pb.authStore.model;
  }
});

const login = async (username: string, password: string): Promise<void> => {
  await pb.collection("users").authWithPassword(username, password);
  if (pb.authStore.isValid) {
    console.log("Login successful");
  }
};

const logout = (): void => {
  pb.authStore.clear();
};

const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

export { login, logout, isAuthenticated };
export default pb;
