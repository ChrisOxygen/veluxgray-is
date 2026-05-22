import { createWasender } from "wasenderapi";

let _wasender: ReturnType<typeof createWasender> | null = null;

export function getWasender() {
  if (!_wasender) {
    _wasender = createWasender(process.env.WASENDERAPI_TOKEN!);
  }
  return _wasender;
}

// WasenderAPI requires E.164 format (+2348012345678).
// Our DB stores phones without the + (2348012345678), so we add it here.
export function toE164(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

export async function checkWhatsAppNumber(phone: string): Promise<boolean> {
  const res = await fetch(
    `https://www.wasenderapi.com/api/on-whatsapp/${encodeURIComponent(toE164(phone))}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WASENDERAPI_TOKEN}`,
      },
    },
  );

  if (!res.ok) return false;

  const body = (await res.json()) as {
    success: boolean;
    data?: { exists: boolean };
  };

  return body.success === true && body.data?.exists === true;
}
