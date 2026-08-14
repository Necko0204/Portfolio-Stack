"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fallbackProjects, type Project } from "../data";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

type FormState = Omit<Project, "id"> & { id?: string };

const blankProject: FormState = {
  title: "",
  eyebrow: "Client work · 2026",
  description: "",
  url: "",
  repo_url: "",
  image_url: "",
  category: "Client site",
  market: "Philippines",
  tags: [],
  featured: false,
  published: true,
  sort_order: 1,
  accent: "lime",
};

const MAX_PREVIEW_SIZE = 5 * 1024 * 1024;
const previewExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function normalizeHttpUrl(value: string, field: string, required = false): string | null {
  const trimmed = value.trim();
  if (!trimmed && !required) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid http:// or https:// address.`);
  }
}

export default function AdminDashboard() {
  const supabase = getSupabase();
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState>(blankProject);
  const [tagText, setTagText] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadProjects = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("projects").select("*").order("sort_order");
    if (error) setNotice(error.message);
    else setProjects((data || []) as Project[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setSessionReady(true);
      if (data.session) loadProjects();
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      if (session) loadProjects();
    });
    return () => data.subscription.unsubscribe();
  }, [loadProjects, supabase]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setSigningIn(true);
    setAuthMessage("Signing in…");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      setAuthMessage(error ? "Unable to sign in. Check your details and try again." : "Welcome back.");
      if (!error) setPassword("");
    } catch {
      setAuthMessage("Unable to sign in right now. Please try again shortly.");
    } finally {
      setSigningIn(false);
    }
  }

  function editProject(project: Project) {
    setForm({ ...project });
    setTagText(project.tags.join(", "));
    setEditing(true);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm({ ...blankProject, sort_order: projects.length + 1 });
    setTagText("");
    setEditing(false);
    setNotice("");
  }

  async function uploadPreview(file: File) {
    if (!supabase) return null;
    const extension = previewExtensions[file.type];
    if (!extension) throw new Error("Preview must be a PNG, JPG, or WebP image.");
    if (file.size > MAX_PREVIEW_SIZE) throw new Error("Preview must be 5 MB or smaller.");

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) throw new Error("Your session expired. Please sign in again.");

    const path = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("project-previews").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from("project-previews").getPublicUrl(path).data.publicUrl;
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setNotice("Saving your project…");

    try {
      const fileInput = event.currentTarget.elements.namedItem("preview_file") as HTMLInputElement;
      const uploadedUrl = fileInput.files?.[0] ? await uploadPreview(fileInput.files[0]) : null;
      const liveUrl = normalizeHttpUrl(form.url, "Live URL", true);
      const repositoryUrl = normalizeHttpUrl(form.repo_url || "", "Repository URL");
      const previewUrl = normalizeHttpUrl(form.image_url || "", "Preview image URL");
      const payload = {
        ...form,
        id: form.id || crypto.randomUUID(),
        title: form.title.trim(),
        eyebrow: form.eyebrow.trim(),
        description: form.description.trim(),
        url: liveUrl,
        image_url: uploadedUrl || previewUrl,
        repo_url: repositoryUrl,
        market: form.market.trim(),
        tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
        updated_at: new Date().toISOString(),
      };

      const { error } = editing
        ? await supabase.from("projects").update(payload).eq("id", payload.id)
        : await supabase.from("projects").insert(payload);
      if (error) throw error;

      await loadProjects();
      resetForm();
      setNotice("Saved. The public portfolio is now updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function removeProject(project: Project) {
    if (!supabase || !window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    setNotice(error ? error.message : "Project deleted.");
    if (!error) loadProjects();
  }

  async function seedPortfolio() {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.from("projects").upsert(fallbackProjects, { onConflict: "id" });
    setNotice(error ? error.message : "Your eight starter projects are now in Supabase.");
    setSaving(false);
    if (!error) loadProjects();
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-shell setup-shell">
        <Link className="admin-back" href="/">← Back to portfolio</Link>
        <div className="setup-card">
          <span className="admin-kicker">Portfolio Studio / Setup</span>
          <h1>Connect your<br /><em>Supabase.</em></h1>
          <p>
            The public portfolio already works with your eight projects. Connect a
            free Supabase project when you’re ready to add, edit, reorder, and upload
            previews from this private studio.
          </p>
          <ol>
            <li><span>01</span><div><strong>Create a Supabase project</strong><small>Then run the included <code>supabase/schema.sql</code> in its SQL Editor.</small></div></li>
            <li><span>02</span><div><strong>Create and allow your admin user</strong><small>In Authentication → Users, add your login, then run the final commented allowlist query in the schema file with your email.</small></div></li>
            <li><span>03</span><div><strong>Add two local environment values</strong><small>Copy <code>.env.example</code> to <code>.env.local</code> and paste your project URL and anon key.</small></div></li>
          </ol>
          <div className="setup-note">No keys yet? That’s fine—the main portfolio remains fully usable.</div>
        </div>
      </main>
    );
  }

  if (!sessionReady) return <div className="admin-loading">Opening Portfolio Studio…</div>;

  if (!signedIn) {
    return (
      <main className="admin-shell login-shell">
        <Link className="admin-back" href="/">← Back to portfolio</Link>
        <form className="login-card" onSubmit={signIn}>
          <span className="admin-kicker">Private access</span>
          <h1>PORTFOLIO<br /><em>STUDIO.</em></h1>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" maxLength={254} /></label>
          <label>
            Password
            <span className="password-control">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <span className="eye-icon" aria-hidden="true" />
              </button>
            </span>
          </label>
          <button className="login-submit" type="submit" disabled={signingIn}>{signingIn ? "Checking…" : "Enter studio →"}</button>
          {authMessage && <p className="form-notice">{authMessage}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div><span>MM®</span><p>Portfolio Studio<br />Content control</p></div>
        <nav><Link href="/" target="_blank" rel="noopener noreferrer">View live ↗</Link><button type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button></nav>
      </header>

      <section className="dashboard-intro">
        <span className="admin-kicker">Dashboard / {projects.length || 0} projects</span>
        <h1>MAKE THE WORK<br /><em>IMPOSSIBLE TO MISS.</em></h1>
        <p>Add a link, upload a screenshot, write the proof. Your portfolio handles the rest.</p>
      </section>

      <div className="dashboard-grid">
        <section className="editor-panel">
          <div className="panel-title"><span>{editing ? "Edit project" : "New project"}</span>{editing && <button type="button" onClick={resetForm}>Cancel edit</button>}</div>
          <form onSubmit={saveProject} className="project-form">
            <label className="wide">Project title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={120} placeholder="A clear, memorable title" /></label>
            <label className="wide">Live URL<input type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} required maxLength={2048} placeholder="https://" /></label>
            <label>Project label<input value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} maxLength={100} placeholder="Client work · 2026" /></label>
            <label>Market<input value={form.market} onChange={(event) => setForm({ ...form, market: event.target.value })} maxLength={80} placeholder="Philippines" /></label>
            <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Client site</option><option>Client system</option><option>Web platform</option><option>OJT system</option><option>Portfolio</option><option>Product site</option><option>One-pager</option></select></label>
            <label>Accent<select value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })}><option value="lime">Electric lime</option><option value="coral">Hot coral</option><option value="blue">Signal blue</option><option value="violet">Violet</option><option value="yellow">Yellow</option></select></label>
            <label className="wide">What did you build?<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required maxLength={1500} rows={4} placeholder="Describe the problem, your role, and what shipped." /></label>
            <label className="wide">Skills / tools<input value={tagText} onChange={(event) => setTagText(event.target.value)} maxLength={500} placeholder="React, TypeScript, Firebase" /><small>Separate with commas.</small></label>
            <label>Repository URL<input type="url" value={form.repo_url || ""} onChange={(event) => setForm({ ...form, repo_url: event.target.value })} maxLength={2048} placeholder="https://github.com/…" /></label>
            <label>Preview image URL<input type="url" value={form.image_url || ""} onChange={(event) => setForm({ ...form, image_url: event.target.value })} maxLength={2048} placeholder="https://…" /></label>
            <label className="upload-field wide">Upload preview<input name="preview_file" type="file" accept="image/png,image/jpeg,image/webp" /><span>PNG, JPG or WebP · landscape works best</span></label>
            <div className="toggle-row wide">
              <label><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Feature this project</label>
              <label><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Visible on portfolio</label>
            </div>
            <label>Display order<input type="number" min="1" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></label>
            <button className="save-button" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Update project →" : "Publish project →"}</button>
          </form>
          {notice && <p className="dashboard-notice">{notice}</p>}
        </section>

        <aside className="library-panel">
          <div className="panel-title"><span>Project library</span><button type="button" disabled={saving} onClick={seedPortfolio}>Load starter projects</button></div>
          {projects.length === 0 ? (
            <div className="empty-library"><strong>Your database is ready.</strong><p>Load the eight starter projects, or add your first project with the form.</p></div>
          ) : (
            <div className="admin-projects">
              {projects.map((project) => (
                <article key={project.id}>
                  <div className={`admin-thumb accent-${project.accent}`}>
                    {project.image_url ? <img src={project.image_url} alt="" /> : <span>{project.title.slice(0, 2)}</span>}
                  </div>
                  <div><span>{String(project.sort_order).padStart(2, "0")} · {project.published ? "Live" : "Hidden"}</span><strong>{project.title}</strong><small>{project.category} · {project.market}</small></div>
                  <div className="admin-actions"><button type="button" onClick={() => editProject(project)}>Edit</button><button type="button" className="danger" onClick={() => removeProject(project)}>Delete</button></div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
