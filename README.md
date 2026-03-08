# StructureAI MCP Server

Extract structured JSON from unstructured text. Works with any MCP-compatible client (Claude Desktop, Cursor, etc).

## Supported Schemas

- `receipt` — items, totals, dates, merchant info
- `invoice` — line items, amounts, due dates, parties
- `email` — sender, recipients, subject, body, dates
- `resume` — name, experience, education, skills
- `contact` — name, email, phone, address, social
- `custom` — define your own fields

## Install

```bash
npm install -g @avatrix/structureai-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "structureai": {
      "command": "structureai-mcp"
    }
  }
}
```

### From source

```bash
git clone https://github.com/avatrix1/structureai-mcp.git
cd structureai-mcp
npm install && npm run build
node dist/index.js
```

## Usage

The server exposes one tool: `extract_structured_data`

**Parameters:**
- `text` (required) — The unstructured text to extract from
- `schema` (required) — One of: receipt, invoice, email, resume, contact, custom
- `custom_fields` (optional) — Array of field names when using "custom" schema
- `api_key` (optional) — Your API key for higher limits

## Pricing

- **Free tier:** 10 requests, no key needed
- **Paid:** $2 for 500 requests — get a key at https://api-service-wine.vercel.app

## License

MIT
