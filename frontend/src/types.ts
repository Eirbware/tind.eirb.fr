export interface User {
  id: string;
  username: string;
  diplome: string;
  shotgunDate: string;
  favorites: string[];
  firstName: string;
  lastName: string;
  parrain: string;
  infos: {
    res: string[] | null;
    sex: string | null;
  } | null;
  [key: string]: any;
}
