<script lang="ts">
  import { onMount } from "svelte";
  import { BookOpen, Plus, Search, Trash2, Users } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import AddModal from "../modals/AddModal.svelte";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import type { Course } from "../api/courseApi";

  let search = "";
  let mineOnly = false;
  let addOpen = false;
  let loading = true;
  let filteredCourses: Course[] = [];

  onMount(async () => {
    await coursesStore.asyncSetCourses();
    loading = false;
  });

  $: {
    const query = search.trim().toLocaleLowerCase();
    const profileId = $usersStore.profile?.id;
    filteredCourses = $coursesStore.courses.filter((course) => {
      const matchesQuery =
        !query ||
        course.title.toLocaleLowerCase().includes(query) ||
        course.description.toLocaleLowerCase().includes(query) ||
        course.author?.name?.toLocaleLowerCase().includes(query);
      const matchesOwner = !mineOnly || String(course.user_id) === String(profileId);
      return matchesQuery && matchesOwner;
    });
  }

  async function deleteCourse(course: Course) {
    const result = await showConfirmDialog(`Hapus kursus "${course.title}"?`);
    if (!result.isConfirmed) return;
    await coursesStore.asyncSetIsCourseDelete(course.id);
    if (coursesStore.isCourseDeleted) {
      coursesStore.setIsCourseDelete(false);
      coursesStore.setIsCourseDeleted(false);
      await coursesStore.asyncSetCourses();
    }
  }

  async function deleteAllCourses() {
    const result = await showConfirmDialog("Hapus semua kursus yang Anda buat?");
    if (!result.isConfirmed) return;
    await coursesStore.asyncSetIsCourseDeleteAll();
    if (coursesStore.isCourseDeletedAll) {
      coursesStore.setIsCourseDeleteAll(false);
      coursesStore.setIsCourseDeletedAll(false);
      await coursesStore.asyncSetCourses();
    }
  }
</script>

<svelte:head>
  <title>Semua Kursus | Delcom Courses</title>
  <meta name="description" content="Temukan dan kelola kursus pembelajaran." />
</svelte:head>

<section class="space-y-7">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-sm font-semibold text-indigo-600">BELAJAR BERSAMA</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-900">Semua Kursus</h1>
      <p class="mt-2 text-slate-500">Jelajahi materi baru atau bagikan pengetahuanmu.</p>
    </div>
    <div class="flex gap-2">
      {#if $usersStore.profile}
        <button
          type="button"
          onclick={deleteAllCourses}
          class="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <Trash2 size={17} /> Hapus Kursus Saya
        </button>
        <button
          type="button"
          onclick={() => (addOpen = true)}
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={18} /> Buat Kursus
        </button>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
    <label class="relative block flex-1">
      <Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        aria-label="Cari kursus"
        type="search"
        bind:value={search}
        placeholder="Cari judul, deskripsi, atau pengajar..."
        class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
    <label class="inline-flex items-center gap-2 px-2 text-sm font-medium text-slate-600">
      <input type="checkbox" bind:checked={mineOnly} class="rounded border-slate-300 text-indigo-600" />
      Kursus saya
    </label>
  </div>

  {#if loading}
    <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
      Memuat daftar kursus...
    </div>
  {:else if filteredCourses.length === 0}
    <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <BookOpen size={34} class="mx-auto text-slate-400" />
      <h2 class="mt-4 text-lg font-semibold text-slate-800">
        {$coursesStore.courses.length ? "Kursus tidak ditemukan" : "Belum ada kursus"}
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        {$coursesStore.courses.length
          ? "Coba kata kunci atau filter yang berbeda."
          : "Jadilah yang pertama membuat kursus pembelajaran."}
      </p>
    </div>
  {:else}
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {#each filteredCourses as course (course.id)}
        <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <a href={`/courses/${course.id}`} class="block">
            {#if course.cover}
              <img src={course.cover} alt={`Sampul ${course.title}`} class="h-44 w-full object-cover" />
            {:else}
              <div class="flex h-44 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-500">
                <BookOpen size={44} />
              </div>
            {/if}
          </a>
          <div class="space-y-3 p-5">
            <div class="flex items-start justify-between gap-3">
              <a href={`/courses/${course.id}`} class="line-clamp-2 text-lg font-bold text-slate-900 hover:text-indigo-700">
                {course.title}
              </a>
              {#if $usersStore.profile && String(course.user_id) === String($usersStore.profile.id)}
                <button type="button" aria-label={`Hapus kursus ${course.title}`} onclick={() => deleteCourse(course)} class="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={17} />
                </button>
              {/if}
            </div>
            <p class="line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
            <div class="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>{course.author?.name || "Pengajar Delcom"}</span>
              <span class="inline-flex items-center gap-1"><Users size={14} /> {course.students?.length ?? 0} peserta</span>
            </div>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>

<AddModal show={addOpen} onClose={() => (addOpen = false)} />
