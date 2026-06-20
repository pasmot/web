export type Dealer = {
  id: string;
  name: string;
  initials: string;
  location: string;
  verified: boolean;
  joined: string;
  responseTime: string;
  /** Mock WhatsApp number, digits only with country code */
  whatsapp: string;
  description: string;
};
