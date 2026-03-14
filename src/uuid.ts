/**
 * Returns a random UUID string.
 */
export function uuid(): string {
  if (crypto.randomUUID != null) {
    return crypto.randomUUID();
  }

  // Annoyingly, web spec peeps decided that crypto.randomUUID should not
  // available in "insecure" environments (a.k.a. pages other than localhost
  // which were loaded with HTTP instead of HTTPS). In production that's never
  // an issue for me, but I run into this is when locally testing a page served
  // over LAN to my phone.
  //
  // For these situations, fallback to a manual implementation, using
  // crypto.getRandomValues which is available.
  return generateUuidV4();
}

function generateUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // According to the UUID v4 spec, the format is:
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  //
  // where:
  // - x is any random hex digit
  // - 4 is... 4, i.e. version 4
  // - y is either 8, 9, A, or B
  //
  // So just setting those 4 and y bits accordingly.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
