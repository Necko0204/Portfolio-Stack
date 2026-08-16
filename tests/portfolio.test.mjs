import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("uses portfolio-specific metadata", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
  ]);

  assert.match(page, /Marc Mendoza/);
  assert.match(page, /Full-stack developer/);
  assert.match(layout, /Marc Mendoza portfolio/);
  assert.match(layout, /\/og\.png/);
});

test("includes the public portfolio and private studio routes", async () => {
  await Promise.all([
    access(new URL("app/page.tsx", projectRoot)),
    access(new URL("app/admin/page.tsx", projectRoot)),
    access(new URL("app/admin/AdminDashboard.tsx", projectRoot)),
    access(new URL("supabase/schema.sql", projectRoot)),
  ]);
});
