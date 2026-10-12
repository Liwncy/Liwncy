# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vue 3 + Vite + TypeScript for the site. Hono on Cloudflare Workers for the API. No component library until one is explicitly requested.

## Users

李芈仙 owns 芈仙居 and maintains it. Visitors open the public pages to find a place and leave.

## Product Purpose

芈仙居 is a personal site. The bookmark page lets a visitor find a saved link by category or by search, then open it. Success is reaching the right site in a few seconds.

## Positioning

The links are the owner's own catalog, kept inside 芈仙居. It is not a bookmark product for other people to manage their own collections.

## Operating Context

The public bookmark page is for browsing. Adding, editing, and removing categories and links happens in the admin.

## Capabilities and Constraints

- Public bookmark page: categories and search. No separate sources such as 我的书签, 喜欢, or 随机.
- The owner configures bookmarks in the admin.
- One feature is one module on the API and one feature area on the UI.
- Do not add a component library until asked.

## Brand Commitments

The site name is 芈仙居. The author named on the homepage is 李芈仙. The homepage portrait, poem, and existing visual system stay in place for pages that extend that world.

## Evidence on Hand

The homepage is implemented in `mi-xian-ju-ui`. The current `/bookmark` route is a placeholder. An older bookmark screen and its data live on the git branch `archive/api-platform`. Do not invent visitor counts, testimonials, or usage statistics.

## Product Principles

- Visitors browse. The owner edits in the admin.
- A page does one job: find a link, or maintain the catalog.
- Add a shared layer only when a second feature needs it.
- Keep public pages free of configuration controls.
