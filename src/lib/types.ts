import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface EstablishmentInfo {
  nom: string;
  adresse: string;
  telephone: string;
  horaires: string;
  specificites: string;
}

export interface MenuItem {
  nom: string;
  composition: string;
  prix?: number;
  prix_a_emporter?: number;
  prix_sur_place?: number;
  image: SanityImageSource;
  fait_maison: boolean;
}

export interface MenuData {
  infos_etablissement: EstablishmentInfo;
  pizzas_base_tomates: MenuItem[];
  pizzas_base_creme: MenuItem[];
  specialites: MenuItem[];
  sandwichs: MenuItem[];
  desserts: MenuItem[];
  salades: MenuItem[];
  boissons: MenuItem[];
}

export type FlipbookPage =
  | { type: 'cover'; info: EstablishmentInfo }
  | { type: 'section'; title: string }
  | { type: 'item'; item: MenuItem };
