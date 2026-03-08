#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://api-service-wine.vercel.app";

// Free tier: 10 requests without a key
let freeUsage = 0;
const FREE_LIMIT = 10;

const server = new McpServer({
  name: "structureai",
  version: "1.0.0",
});

server.tool(
  "extract_structured_data",
  "Extract structured JSON from unstructured text. Supports schemas: receipt, invoice, email, resume, contact, custom. Free tier: 10 requests. Get an API key at https://api-service-wine.vercel.app for 500 more requests ($2).",
  {
    text: z.string().describe("The unstructured text to extract data from"),
    schema: z
      .enum(["receipt", "invoice", "email", "resume", "contact", "custom"])
      .describe("The type of data to extract"),
    custom_fields: z
      .array(z.string())
      .optional()
      .describe("Custom field names when schema is 'custom'"),
    api_key: z
      .string()
      .optional()
      .describe(
        "Your API key. Get one at https://api-service-wine.vercel.app ($2 for 500 requests)"
      ),
  },
  async ({ text, schema, custom_fields, api_key }) => {
    // Check free tier
    if (!api_key) {
      freeUsage++;
      if (freeUsage > FREE_LIMIT) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Free tier exhausted (${FREE_LIMIT} requests). Get an API key at https://api-service-wine.vercel.app for 500 more requests ($2).`,
            },
          ],
        };
      }
    }

    // If no API key and still in free tier, use a demo key or call directly
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-source": "mcp",
    };

    if (api_key) {
      headers["x-api-key"] = api_key;
    }

    try {
      const body: Record<string, unknown> = { text, schema };
      if (schema === "custom" && custom_fields) {
        body.custom_fields = custom_fields;
      }

      const response = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${result.error || "Extraction failed"}. ${
                response.status === 401
                  ? "Get an API key at https://api-service-wine.vercel.app"
                  : ""
              }`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to connect to StructureAI API. Please try again.`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
