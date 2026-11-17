# Content schema

`content/` holds the site's content. The generator (`src/`, `eleventy.config.js`) reads it to
build `_site/`. Nothing in `content/` knows about layouts, URLs or templates.

Every build checks the content against this schema and stops if anything is invalid, naming
each file and field at fault. To check without building:

```
npm run validate
```

`lib/content.js` holds the same rules as code. Change both together.

## Ground rules

1. **Unknown fields are rejected.** Only the fields listed for a type may appear. To add a field,
   change this file and `lib/content.js` together.
2. **Required fields must be present** and non-empty.
3. **Fields hold plain text, not HTML.**

## Types

| Type | File |
|---|---|
| Site settings | `site.yaml` |

---

## `site.yaml`: site settings

Plain YAML, one `field: value` per line.

| Field | Required | What it is |
|---|---|---|
| `name` | yes | The Lab's short name, shown as the Home heading: `ATLAS Lab`. |
| `full_name` | yes | The Lab's full name: `ATLAS Research Laboratory — AI Trust, Learning, Architecture, and Security`. |
| `mission` | yes | One line saying what the Lab does. Also the default page description for search engines and link previews. |
| `mailbox` | yes | The Lab mailbox, an email address. |

```yaml
name: ATLAS Lab
full_name: ATLAS Research Laboratory — AI Trust, Learning, Architecture, and Security
mission: Research on the cybersecurity of AI agents, at the Technion's Faculty of Computer Science.
mailbox: atlaslab.at.technion@gmail.com
```
