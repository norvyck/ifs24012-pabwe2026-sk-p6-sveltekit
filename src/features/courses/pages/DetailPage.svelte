<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { ArrowLeft, BookOpen, ImagePlus, Pencil, PlayCircle, Plus, Star, Trash2, Users } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import type { Course, CourseContent } from "../api/courseApi";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";

  let courseId = $derived(page.params.courseId ?? "");
  let course: Course | null = $state(null);
  let loading = $state(true);
  let editOpen = $state(false);
  let coverOpen = $state(false);
  let contentOpen = $state(false);
  let editingContent = $state<CourseContent | null>(null);
  let rating = $state(5);
  let comment = $state("");

  $effect(() => {
    if (!courseId) return;
    loading = true;
    coursesStore.asyncSetCourse(courseId).then(() => {
      course = coursesStore.course;
      loading = false;
    });
  });

  let isOwner = $derived(
    Boolean(course && $usersStore.profile && String(course.user_id) === String($usersStore.profile.id))
  );
  let isStudent = $derived(
    Boolean(course?.students?.some((id) => String(id) === String($usersStore.profile?.id)))
  );
  let canManage = $derived(isOwner);

  async function refresh() {
    await coursesStore.asyncSetCourse(courseId);
    course = coursesStore.course;
  }

  async function toggleEnrollment() {
    if (!course) return;
    if (isStudent) {
      await coursesStore.asyncSetIsStudentLeave(course.id);
      if (coursesStore.isStudentLeft) {
        coursesStore.setIsStudentLeave(false);
        coursesStore.setIsStudentLeft(false);
        await refresh();
      }
    } else {
      await coursesStore.asyncSetIsStudentJoin(course.id);
      if (coursesStore.isStudentJoined) {
        coursesStore.setIsStudentJoin(false);
        coursesStore.setIsStudentJoined(false);
        await refresh();
      }
    }
  }

  async function submitRating() {
    if (!course || !comment.trim()) return;
    await coursesStore.asyncSetIsRatingChange(course.id, rating, comment.trim());
    if (coursesStore.isRatingChanged) {
      coursesStore.setIsRatingChange(false);
      coursesStore.setIsRatingChanged(false);
      comment = "";
      await refresh();
    }
  }

  async function deleteContent(content: CourseContent) {
    const result = await showConfirmDialog(`Hapus materi "${content.title}"?`);
    if (!result.isConfirmed) return;
    await coursesStore.asyncSetIsContentDelete(content.id);
    if (coursesStore.isContentDeleted) {
      coursesStore.setIsContentDelete(false);
      coursesStore.setIsContentDeleted(false);
      await refresh();
    }
  }
</script>

<svelte:head>
  <title>{course?.title || "Detail Kursus"} | Delcom Courses</title>
  <meta name="description" content={course?.description ? course.description.slice(0, 150) : "Detail kursus pembelajaran Delcom Courses"} />
</svelte:head>

{#if loading}
  <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
    <h1 class="text-xl font-bold text-slate-700">Memuat kursus...</h1>
  </div>
{:else if !course}
  <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
    <h1 class="text-xl font-bold text-slate-900">Kursus tidak ditemukan</h1>
    <button type="button" onclick={() => goto("/")} class="mt-4 text-sm font-semibold text-indigo-600">Kembali ke semua kursus</button>
  </div>
{:else}
  <div class="space-y-7">
    <a href="/" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"><ArrowLeft size={17} /> Semua Kursus</a>
    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {#if course.cover}
        <img src={course.cover} alt={`Sampul ${course.title}`} class="h-56 w-full object-cover sm:h-72" />
      {:else}
        <div class="flex h-56 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-500 sm:h-72"><BookOpen size={56} /></div>
      {/if}
      <div class="space-y-5 p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-indigo-600">{course.author?.name || "Pengajar Delcom"}</p>
            <h1 class="mt-1 text-3xl font-bold text-slate-900">{course.title}</h1>
          </div>
          <div class="flex flex-wrap gap-2">
            {#if canManage}
              <button type="button" onclick={() => (coverOpen = true)} class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ImagePlus size={16} /> Sampul</button>
              <button type="button" onclick={() => (editOpen = true)} class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Pencil size={16} /> Ubah</button>
            {:else if $usersStore.profile}
              <button type="button" onclick={toggleEnrollment} class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{isStudent ? "Keluar dari Kursus" : "Ikuti Kursus"}</button>
            {/if}
          </div>
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-slate-600">
          <span class="inline-flex items-center gap-1.5"><Users size={16} /> {course.students?.length ?? 0} peserta</span>
          <span class="inline-flex items-center gap-1.5"><PlayCircle size={16} /> {course.total_contents ?? course.contents?.length ?? 0} materi</span>
          <span class="inline-flex items-center gap-1.5"><Star size={16} class="text-amber-500" /> {course.avg_ratings ?? "Belum ada rating"}</span>
          {#if course.my_percentage_finished !== undefined}<span>{course.my_percentage_finished}% selesai</span>{/if}
        </div>
        <div class="border-t border-slate-100 pt-5">
          <h2 class="mb-3 text-lg font-bold text-slate-900">Tentang Kursus</h2>
          <MarkdownViewer content={course.description} />
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div><h2 class="text-xl font-bold text-slate-900">Materi Kursus</h2><p class="mt-1 text-sm text-slate-600">Ikuti materi untuk menyelesaikan kursus.</p></div>
        {#if canManage}
          <button type="button" onclick={() => { editingContent = null; contentOpen = true; }} class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={17} /> Tambah Materi</button>
        {/if}
      </div>
      {#if course.contents?.length}
        <ol class="mt-5 divide-y divide-slate-100">
          {#each course.contents as content, index (content.id)}
            <li class="flex items-center gap-4 py-4">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">{index + 1}</span>
              <a href={`/courses/${course.id}/contents/${content.id}`} class="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span class="truncate font-semibold text-slate-800 hover:text-indigo-600">{content.title}</span>
                <span class="shrink-0 text-xs text-slate-600">{content.my_status_finished ? "Selesai" : "Belum dipelajari"}</span>
              </a>
              {#if canManage}
                <button type="button" aria-label={`Ubah materi ${content.title}`} onclick={() => { editingContent = content; contentOpen = true; }} class="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Pencil size={16} /></button>
                <button type="button" aria-label={`Hapus materi ${content.title}`} onclick={() => deleteContent(content)} class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              {/if}
            </li>
          {/each}
        </ol>
      {:else}
        <p class="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600">Belum ada materi untuk kursus ini.</p>
      {/if}
    </section>

    {#if isStudent && !isOwner}
      <section class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-xl font-bold text-slate-900">Beri Rating</h2>
        <form class="mt-4 space-y-3" onsubmit={(event) => { event.preventDefault(); submitRating(); }}>
          <label class="block text-sm font-medium text-slate-700">Rating
            <select bind:value={rating} class="mt-1 block rounded-xl border border-slate-200 px-3 py-2">
              {#each [5, 4, 3, 2, 1] as value}<option value={value}>{value} / 5</option>{/each}
            </select>
          </label>
          <label class="block text-sm font-medium text-slate-700">Komentar
            <textarea bind:value={comment} required rows="3" class="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500" placeholder="Bagikan pengalaman belajarmu"></textarea>
          </label>
          <button type="submit" class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Kirim Rating</button>
        </form>
        {#if course.ratings?.length}
          <div class="mt-6 space-y-3">
            {#each course.ratings as item}
              <article class="rounded-xl bg-slate-50 p-4">
                <div class="flex items-center justify-between gap-3"><strong class="text-sm text-slate-800">{item.name}</strong><span class="text-sm text-amber-600">{"★".repeat(Math.max(0, Math.min(5, item.ratings)))}</span></div>
                <p class="mt-2 text-sm text-slate-600">{item.comment}</p>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </div>
{/if}

{#if course}
  <ChangeModal show={editOpen} {course} onClose={() => (editOpen = false)} onChanged={refresh} />
  <ChangeCoverModal show={coverOpen} {course} onClose={() => (coverOpen = false)} onChanged={refresh} />
  <ContentModal show={contentOpen} courseId={course.id} content={editingContent} onClose={() => (contentOpen = false)} onChanged={refresh} />
{/if}
