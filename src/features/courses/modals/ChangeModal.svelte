<script lang="ts">
  import { LoaderCircle, Pencil, X } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";

  export let show = false;
  export let course: Course;
  export let onClose: (() => void) | undefined = undefined;
  export let onChanged: (() => void | Promise<void>) | undefined = undefined;

  let title = "";
  let description = "";
  let loading = false;

  $: if (show && course) {
    title = course.title;
    description = course.description;
  }

  async function submit() {
    if (!title.trim() || !description.trim()) {
      await showErrorDialog("Judul dan deskripsi kursus wajib diisi.");
      return;
    }
    loading = true;
    await coursesStore.asyncSetIsCourseChange(course.id, title.trim(), description.trim());
    loading = false;
    const succeeded = coursesStore.isCourseChanged;
    coursesStore.setIsCourseChange(false);
    coursesStore.setIsCourseChanged(false);
    if (succeeded) {
      await onChanged?.();
      onClose?.();
    }
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
    <dialog open aria-labelledby="change-course-title" class="m-auto flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="change-course-title" class="text-lg font-bold text-slate-900">Ubah Kursus</h2>
        <button type="button" aria-label="Tutup" onclick={() => onClose?.()} class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
      </header>
      <form onsubmit={(event) => { event.preventDefault(); submit(); }} class="flex min-h-0 flex-1 flex-col">
        <div class="flex-1 space-y-4 overflow-y-auto p-5">
          <label class="block text-sm font-semibold text-slate-700">Judul kursus
            <input bind:value={title} required class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
          </label>
          <label class="block text-sm font-semibold text-slate-700">Deskripsi
            <div class="mt-1 min-h-64"><MarkdownEditor bind:value={description} placeholder="Deskripsi kursus dalam Markdown" height="16rem" /></div>
          </label>
        </div>
        <footer class="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button type="button" disabled={loading} onclick={() => onClose?.()} class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200">Batal</button>
          <button type="submit" disabled={loading} class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {#if loading}<LoaderCircle size={16} class="animate-spin" />{:else}<Pencil size={16} />{/if} Simpan
          </button>
        </footer>
      </form>
    </dialog>
  </div>
{/if}
