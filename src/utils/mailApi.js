// utils/mailApi.js
export async function fetchMails({ email, password, folder = "INBOX", page = 1, limit = 20 }) {
  const params = new URLSearchParams({
    email,
    password,
    folder,
    page,
    limit,
  });
  const res = await fetch(`https://mailbackend.sharda.co.in/api/email/all-mails?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch mails");
  }
  const data = await res.json();
  return data;
}
