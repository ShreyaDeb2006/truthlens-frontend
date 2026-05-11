const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export async function scanContent(data) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
export default API_URL;
