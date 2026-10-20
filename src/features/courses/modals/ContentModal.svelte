<script lang="ts">
  import { LoaderCircle, Plus, X } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { CourseContent } from "../api/courseApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let courseId: string | number;
  export let content: CourseContent | null = null;
  export let onClose: (() => void) | undefined = undefined;
  export let onChanged: (() => void | Promise<void>) | undefined = undefined;

  let title = "";
  let youtube = "";
  let loading = false;

  $: if (show) {
    title = content?.title ?? "";
    youtube = content?.youtube ?? "";
  }

  async function submit() {
    if (!title.trim() || !youtube.trim()) {
      await showErrorDialog("Judul materi dan tautan YouTube wajib diisi.");
      return;
    }
    try {
      new URL(youtube);
    } catch {
      await showErrorDialog("Tautan video harus berupa URL yang valid.");
      return;
    }
    loading = true;
    if (content) {
      await coursesStore.asyncSetIsContentChange(content.id, title.trim(), youtube.trim());
    } else {
      await coursesStore.asyncSetIsContentAdd(courseId, title.trim(), youtube.trim());
    }
    loading = false;
    const succeeded = content ? coursesStore.isContentChanged : coursesStore.isContentAdded;
    if (content) {
      coursesStore.setIsContentChange(false);
      coursesStore.setIsContentChanged(false);
    } else {
      coursesStore.setIsContentAdd(false);
      coursesStore.setIsContentAdded(false);
    }
    if (succeeded) {
      await onChanged?.();
      onClose?.();
    }
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <dialog open aria-labelledby="content-modal-title" class="m-auto w-full max-w-lg rounded-2xl border-0 bg-white p-0 shadow-2xl">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="content-modal-title" class="text-lg font-bold text-slate-900">{content ? "Ubah Materi" : "Tambah Materi"}</h2>
        <button type="button" aria-label="Tutup" onclick={() => onClose?.()} class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
      </header>
      <form onsubmit={(event) => { event.preventDefault(); submit(); }} class="space-y-4 p-5">
        <label class="block text-sm font-semibold text-slate-700">Judul materi
          <input bind:value={title} required placeholder="Contoh: Pengenalan Svelte" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </label>
        <label class="block text-sm font-semibold text-slate-700">Tautan YouTube
          <input bind:value={youtube} type="url" required placeholder="https://www.youtube.com/watch?v=..." class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </label>
        <footer class="flex justify-end gap-2 pt-2">
          <button type="button" disabled={loading} onclick={() => onClose?.()} class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
          <button type="submit" disabled={loading} class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {#if loading}<LoaderCircle size={16} class="animate-spin" />{:else}<Plus size={16} />{/if} Simpan Materi
          </button>
        </footer>
      </form>
    </dialog>
  </div>
{/if}
