---
name: x-twitter-scraper-general
description: Use Xquik for X (Twitter) search, profile data, follower exports, media downloads, monitoring, webhooks, MCP setup, and confirmed posting workflows.
---

# Xquik X (Twitter) Data Workflows

## Overview

Use this skill when a user needs X (Twitter) data or account automation through Xquik. Xquik provides a REST API, SDKs, webhooks, bulk extraction jobs, and a remote MCP server for AI coding agents.

## When to Use This Skill

Use Xquik when the user asks to:
- Search recent or historical X posts.
- Look up X profiles, followers, following, lists, communities, or spaces.
- Export followers, replies, quote posts, likes, reposts, bookmarks, or media.
- Monitor accounts, keywords, hashtags, competitors, or trends.
- Download X media or archive giveaway results.
- Draft, post, reply, quote, like, repost, follow, unfollow, or send DMs with explicit confirmation.
- Connect an AI agent or IDE to Xquik through MCP.

Do not use this skill for unsupported account takeover, scraping private content without authorization, harassment, spam, or bypassing a platform's security controls.

## Required Context

Before making API calls, confirm the user has:
- A Xquik API key stored in a secure secret manager or environment variable.
- Permission to access the requested account, dataset, or workflow.
- A clear output format such as JSON, CSV, Markdown summary, or webhook event.

Never ask for X passwords, 2FA codes, recovery codes, cookies, session tokens, or backup files.

## Workflow

1. Identify the user's goal and map it to a Xquik API, SDK, extraction job, webhook, or MCP workflow.
2. Prefer read-only endpoints for discovery and previews.
3. For bulk data, create an extraction job and poll for completion instead of paginating manually.
4. For posting or account-changing actions, show the exact action summary and ask for explicit confirmation before execution.
5. Store API keys only in the user's local secret mechanism. Do not paste keys into code, logs, issue bodies, commits, or chat transcripts.
6. Return concise, structured results and include pagination or job IDs when follow-up work may be needed.

## Public References

- Docs: `https://docs.xquik.com`
- Repository: `https://github.com/Xquik-dev/x-twitter-scraper`
- Skill install: `npx skills@1.5.3 add Xquik-dev/x-twitter-scraper`
- MCP overview: `https://docs.xquik.com/mcp/overview`
- MCP endpoint: `https://xquik.com/mcp`

## Agent Guidelines

- Use the official docs for endpoint paths, request bodies, and response fields.
- Keep private account data out of logs and generated examples.
- Use environment variables such as `XQUIK_API_KEY` in examples.
- Explain rate limits, retries, and long-running jobs in user-facing terms.
- Direct users to the Xquik dashboard for plan, account, or key management.
