# Reef AI MCP Server

A Model Context Protocol (MCP) server for the Reef AI research paper search API. This server enables Claude Code and other MCP-compatible clients to search for similar research papers using embeddings.

## Tools

### `reef_search`
Search for similar research papers using an abstract or description. Returns matching papers ranked by similarity.

**Parameters:**
- `abstract` (required): The research paper abstract or description to search
- `userId` (optional): Your Reef API user ID (uses env var if not provided)

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Build the server

```bash
npm run build
```

### 3. Configure Claude Code

Run this command to configure MCP server for project.

```
claude mcp add reef-ai node /PATH/TO/PROJECT/reef-mcp-server/dist/index.js \
            --env REEF_USER_ID=YOUR_USER_ID \
            --env REEF_API_URL=https://reef.mobylabs.org \
            --scope project
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REEF_USER_ID` | Your Reef AI user ID (API key) | Required |
| `REEF_API_URL` | Base URL for the Reef API | `https://reef.mobylabs.org` |

## Usage Examples

Once configured, you can use the tools in Claude Code:

**Search for similar papers:**
```
Find research papers similar to this abstract: "We present a novel approach to neural machine translation using attention mechanisms..."
```

**Get results for an existing search:**
```
Get the results for search ID abc-123-def
```

## Credits

Each search costs 1 credit from your Reef AI account. Check your remaining credits on your profile page.
