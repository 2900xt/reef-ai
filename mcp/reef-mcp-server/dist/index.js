#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const REEF_API_BASE_URL = process.env.REEF_API_URL || "https://reef.mobylabs.org";
const REEF_USER_ID = process.env.REEF_USER_ID;
async function searchPapers(userId, abstract) {
    const response = await fetch(`${REEF_API_BASE_URL}/api/reef/papers/new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, abstract }),
    });
    return response.json();
}
function formatPaper(paper, index) {
    const authors = Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors;
    return `
## ${index + 1}. ${paper.title}
- **Authors:** ${authors || "N/A"}
- **Published:** ${paper.publish_date || "N/A"}
- **DOI:** ${paper.doi || "N/A"}
- **Similarity:** ${(paper.similarity * 100).toFixed(1)}%

**Abstract:**
${paper.abstract || "No abstract available"}
`.trim();
}
// Create the MCP server
const server = new McpServer({
    name: "reef-ai",
    version: "1.0.0",
});
// Tool: Search for similar papers
server.tool("reef_search", "Search for similar research papers using an abstract or description. Returns matching papers ranked by similarity. Costs 1 credit per search.", {
    abstract: z.string().describe("The research paper abstract or description to search for similar papers"),
    userId: z.string().optional().describe("Your Reef API user ID. If not provided, uses REEF_USER_ID environment variable"),
}, async ({ abstract, userId }) => {
    const effectiveUserId = userId || REEF_USER_ID;
    if (!effectiveUserId) {
        return {
            content: [
                {
                    type: "text",
                    text: "Error: No user ID provided. Either pass userId parameter or set REEF_USER_ID environment variable.",
                },
            ],
        };
    }
    try {
        const result = await searchPapers(effectiveUserId, abstract);
        if ("error" in result) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${result.error}`,
                    },
                ],
            };
        }
        const { search, papers } = result;
        const papersText = papers.length > 0
            ? papers.map((paper, i) => formatPaper(paper, i)).join("\n\n---\n\n")
            : "No similar papers found.";
        return {
            content: [
                {
                    type: "text",
                    text: `# Search Results

## Your Query
- **Generated Title:** ${search.title}
- **Created:** ${new Date(search.created_at).toLocaleString()}

**Abstract:**
${search.abstract}

---

# Similar Papers (${papers.length} found)

${papersText}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Reef AI MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
