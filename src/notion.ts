// src/notion.ts

// Notion config
const NOTION_API = "https://api.notion.com/v1";
const DB_ID = "9f59a1df-af4e-8200-8b2f-019ebd357bd1"; // Your database ID
const NOTION_VERSION = "2022-06-28"; // Stable version

// Helper to get the API key (reads from your secure location)
async function getToken(): Promise<string> {
  try {
    // Workers can access secrets directly; local dev uses your file
    const key = Deno.readTextFileSync(`${process.env.HOME}/.easyclaw/linkapp/notion_api_key`).trim();
    return key;
  } catch {
    throw new Error("Notion API key not found. Set NOTION_API_KEY env var.");
  }
}

// Convert your internal Invoice object to Notion properties
function toNotionProps(invoice: any) {
  return {
    Name: { title: [{ text: { content: invoice.id } }] },
    "Property ID": { number: Number(invoice.property_id) },
    "Vendor ID": { number: Number(invoice.vendor_id) },
    Amount: { number: invoice.amount },
    Currency: { select: { name: invoice.currency } },
    "Due Date": { date: { start: invoice.due_date } },
    Status: { select: { name: invoice.status } },
    Description: { rich_text: [{ text: { content: invoice.description ?? "" } }] },
    "Document URL": { url: invoice.doc_url ?? "" },
  };
}

// Convert Notion response to your Invoice format
function fromNotion(page: any) {
  return {
    id: page.id,
    property_id: String(page.properties[\"Property ID\"]?.number || ""),
    vendor_id: String(page.properties[\"Vendor ID\"]?.number || ""),
    amount: page.properties.Amount?.number || 0,
    currency: page.properties.Currency?.select?.name || "USD",
    due_date: page.properties[\"Due Date\"]?.date?.start || "",
    status: page.properties.Status?.select?.name || "pending",
    description: page.properties.Description?.rich_text?.[0]?.plain_text || null,
    doc_url: page.properties[\"Document URL\"]?.url || null,
    created_at: page.created_time,
    updated_at: page.last_edited_time,
  };
}

// Generic Notion fetch helper
async function notionFetch(path: string, method = "GET", body?: any) {
  const token = await getToken();
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion ${method} ${path} failed: ${res.status} ${err}`);
  }
  return res.json();
}

// CRUD operations for invoices

export async function listInvoices() {
  const resp = await notionFetch(`/databases/${DB_ID}/query`, "POST", { page_size: 100 });
  return resp.results.map(fromNotion);
}

export async function getInvoice(id: string) {
  const page = await notionFetch(`/pages/${id}`);
  return fromNotion(page);
}

export async function createInvoice(data: any) {
  const payload = {
    parent: { database_id: DB_ID },
    properties: toNotionProps(data),
  };
  const resp = await notionFetch("/pages", "POST", payload);
  return fromNotion(resp);
}

export async function updateInvoice(id: string, data: any) {
  const payload = { properties: toNotionProps({ ...data, id }) };
  const resp = await notionFetch(`/pages/${id}`, "PATCH", payload);
  return fromNotion(resp);
}
