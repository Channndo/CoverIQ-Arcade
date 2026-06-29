export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface EcosystemPartner {
  id: string;
  name: string;
  description: string;
  href?: string;
}
