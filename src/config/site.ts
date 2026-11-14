type Channel = "telegram" | "whatsapp" | "instagram" | "email";

// Direct contact channels shown on the contact page. Empty ones are hidden.
const contact: Record<Channel, string> = {
  telegram: "", // e.g. "@handle"
  whatsapp: "", // e.g. "+98 912 000 0000"
  instagram: "", // e.g. "@handle"
  email: "", // public address
};

// Facts about the business that aren't translated.
export const site = {
  name: "English Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact,
};

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
