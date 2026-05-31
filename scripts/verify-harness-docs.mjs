/**
 * Harness 文档校对：技能索引 + doc/ 门户关键页存在性。
 *
 * 运行：node scripts/verify-harness-docs.mjs
 * 或：pnpm verify:harness
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const root = join(__dirname, "..")
const skillsRoot = join(root, ".agents", "skills")
const indexPath = join(skillsRoot, "index.md")

const DOC_REQUIRED = [
  "doc/index.html",
  "doc/tutorial/index.html",
  "doc/tutorial/getting-started.html",
  "doc/how-to/index.html",
  "doc/reference/index.html",
  "doc/explanation/index.html",
  "doc/explanation/c4-container.html",
  "doc/explanation/c4-component.html",
  "doc/explanation/admin-api.html",
  "doc/how-to/conventions.html",
  "doc/reference/auth-session.html",
  "doc/reference/dynamic-routes.html",
  "doc/reference/collections-crud.html",
  "doc/reference/http-client.html",
  "doc/reference/pinia-state.html",
  "doc/reference/layout-shell.html",
  "doc/how-to/deployment.html",
  "doc/how-to/testing.html",
  "doc/assets/style.css",
  "doc/assets/common.js",
]

function verifySkillsIndex() {
  const errors = []
  if (!existsSync(indexPath)) {
    return [`missing ${indexPath}`]
  }

  const text = readFileSync(indexPath, "utf8")
  const linkRe = /\]\(\.\/([^)]+\.md)\)/g
  const linked = new Set()
  let m
  while ((m = linkRe.exec(text)) !== null) {
    linked.add(m[1])
  }

  const broken = []
  for (const rel of linked) {
    if (!existsSync(join(skillsRoot, rel))) broken.push(rel)
  }

  const skillDirs = readdirSync(skillsRoot).filter((name) => {
    if (name === "index.md" || name.startsWith(".")) return false
    const p = join(skillsRoot, name)
    try {
      return statSync(p).isDirectory() && existsSync(join(p, "SKILL.md"))
    } catch {
      return false
    }
  })

  const missingInIndex = skillDirs.filter((dir) => !text.includes(`./${dir}/SKILL.md`))

  if (broken.length) {
    errors.push("broken links in .agents/skills/index.md:")
    broken.forEach((r) => errors.push(`  - ${r}`))
  }
  if (missingInIndex.length) {
    errors.push("skill dirs not linked from index.md:")
    missingInIndex.forEach((d) => errors.push(`  - ${d}`))
  }

  return errors
}

function verifyDocPortal() {
  return DOC_REQUIRED.filter((rel) => !existsSync(join(root, rel))).map(
    (rel) => `missing doc page: ${rel}`,
  )
}

function main() {
  const errors = [...verifySkillsIndex(), ...verifyDocPortal()]
  if (errors.length) {
    console.error("verify-harness-docs:")
    errors.forEach((line) => console.error(line))
    process.exit(1)
  }
  console.log(`verify-harness-docs: OK (${DOC_REQUIRED.length} doc pages + skills index)`)
}

main()
