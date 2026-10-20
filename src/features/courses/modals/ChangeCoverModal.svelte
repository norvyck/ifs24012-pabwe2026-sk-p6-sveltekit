<script lang="ts">
  import { ImagePlus, LoaderCircle, X } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import type { Course } from "../api/courseApi";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let course: Course;
  export let onClose: (() => void) | undefined = undefined;
  export let onChanged: (() => void | Promise<void>) | undefined = undefined;

  let cover: File | null = null;
  let loading = false;

  async function submit() {
    if (!cover) {
      await showErrorDialog("Pilih berkas gambar sampul terlebih dahulu.");
      return;
    }
    loading = true;
    await coursesStore.asyncSetIsCourseChangeCover(course.id, cover);
    loading = false;
    const succeeded = coursesStore.isCourseChangedCover;
    coursesStore.setIsCourseChangeCover(false);
    coursesStore.setIsCourseChangedCover(false);
    if (succeeded) {
      cover = null;
      await onChanged?.();
      onClose?.();
    }
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <dialog open aria-labelledby="change-cover-title" class="m-auto w-full max-w-lg rounded-2xl border-0 bg-white p-0 shadow-2xl">
      <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="change-cover-title" class="text-lg font-bold text-slate-900">Ubah Sampul Kursus</h2>
        <button type="button" aria-label="Tutup" onclick={() => onClose?.()} class="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
      </header>
      <form onsubmit={(event) => { event.preventDefault(); submit(); }} class="space-y-5 p-5">
        <p class="text-sm text-slate-500">Pilih gambar sampul untuk “{course.title}”.</p>
        <label class="block rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-400">
          <ImagePlus size={30} class="mx-auto text-indigo-500" />
          <span class="mt-2 block text-sm font-medium text-slate-700">{cover?.name || "Pilih gambar"}</span>
          <input type="file" accept="image/*" aria-label="Pilih gambar sampul" class="sr-only" onchange={(event) => { cover = event.currentTarget.files?.[0] ?? null; }} />
        </label>
        <footer class="flex justify-end gap-2">
          <button type="button" disabled={loading} onclick={() => onClose?.()} class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
          <button type="submit" disabled={loading} class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {#if loading}<LoaderCircle size={16} class="animate-spin" />{:else}<ImagePlus size={16} />{/if} Unggah Sampul
          </button>
        </footer>
      </form>
    </dialog>
  </div>
{/if}
