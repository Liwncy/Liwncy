---
version: 1
slug: "mi-xian-ju-ui-src-views-bookmark-index-vue"
primary_target: "mi-xian-ju-ui/src/views/bookmark/index.vue"
related_targets: ["mi-xian-ju-ui/src/views/admin/index.vue"]
---

# Bookmark

Visitor mode: Operate.

The public page lets a visitor choose a category and search, then open a link. The admin page is where categories and links are added, edited, and removed. The public page has no edit controls.

## Direction contract

THESIS: A category column beside a summary sheet and a three-column card grid. The site header stays in place. A right-hand page index stays refused.

OWN-WORLD: Cool Paper, warm sheets, Songti titles, one teal. The current category is teal text with a teal dot. The summary sheet names the category and two counts taken from the loaded links. Each link is a compact sheet: a 32px mark, a title, a two-line description, and a muted host.

STORY: The visitor picks a category or types a query, reads the counts, scans the cards, and opens one link.

FIRST VIEWPORT: The header is unchanged. A 180px column lists 分类, 全部, and the category names. The reading column opens with the sheet 书签 and the three counts, then the search field, then three cards across. The primary action is the first card.

FORM: Category column plus catalog grid. Seed 5601c900.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
