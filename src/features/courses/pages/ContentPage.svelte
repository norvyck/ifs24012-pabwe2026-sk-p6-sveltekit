<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { ArrowLeft, CheckCircle2, Circle, ExternalLink } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import type { Course, CourseContent } from "../api/courseApi";

  let contentId = $derived(page.params.contentId ?? "");
  let content: CourseContent | null = $state(null);
  let course: Course | null = $state(null);
  let loading = $state(true);

  $effect(() => {
    if (!contentId) return;
    loading = true;
    coursesStore.asyncSetContent(contentId).then(async () => {
      content = coursesStore.content;
      if (content?.course_id) {
        await coursesStore.asyncSetCourse(content.course_id);
        course = coursesStore.course;
      }
      loading = false;
    });
  });

  let isOwner = $derived(
    Boolean(course && $usersStore.profile && String(course.user_id) === String($usersStore.profile.id))
  );
  let isStudent = $derived(
    Boolean(course?.students?.some((id) => String(id) === String($usersStore.profile?.id)))
  );
  let canLearn = $derived(Boolean(isStudent && !isOwner));

  function getYouTubeId(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1);
      return parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop() || "";
    } catch {
      return "";
    }
  }

  async function setFinished(finished: boolean) {
    /* v8 ignore if */
    if (!content) return;
    await coursesStore.asyncSetIsContentStatusChange(content.id, finished ? 1 : 0);
    if (coursesStore.isContentStatusChanged) {
      content = { ...content, my_status_finished: finished };
      coursesStore.setIsContentStatusChange(false);
      coursesStore.setIsContentStatusChanged(false);
      /* v8 ignore else */
      if (course) {
        await coursesStore.asyncSetCourse(course.id);
        course = coursesStore.course;
      }
    }
  }
</script>

<svelte:head>
  <!-- /* v8 ignore start */ -->
  <title>{content?.title || "Materi Kursus"} | Delcom Courses</title>
  <meta name="description" content={`Pelajari materi ${content?.title || 'kursus'} di Delcom Courses.`} />
  <!-- /* v8 ignore stop */ -->
</svelte:head>

{#if loading}
  <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
    <h1 class="text-xl font-bold text-slate-700">Memuat materi...</h1>
  </div>
{:else if !content || !course}
  <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
    <h1 class="text-xl font-bold text-slate-900">Materi tidak ditemukan</h1>
    <button type="button" onclick={() => goto("/")} class="mt-4 text-sm font-semibold text-indigo-600">Kembali ke kursus</button>
  </div>
{:else}
  {@const videoId = getYouTubeId(content.youtube)}
  <article class="space-y-6">
    <!-- /* v8 ignore start */ -->
    <a
      href={`/courses/${course.id}`}
      aria-label={`Kembali ke kursus ${course.title || ''}`}
      class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
    >
      <ArrowLeft size={17} /> {course.title}
    </a>
    <!-- /* v8 ignore stop */ -->
    <header>
      <p class="text-sm font-medium text-indigo-600">Materi Kursus</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900">{content.title}</h1>
    </header>
    {#if videoId}
      <div class="aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
        <iframe
          class="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
          title={content.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Tautan video tidak dapat dikenali. <a class="font-semibold underline" href={content.youtube} target="_blank" rel="noreferrer">Buka video <ExternalLink size={14} class="inline" /></a></div>
    {/if}
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <div><h2 class="font-semibold text-slate-900">Status pembelajaran</h2><p class="mt-1 text-sm text-slate-600">{content.my_status_finished ? "Materi ini sudah selesai dipelajari." : "Tandai selesai setelah menonton materi."}</p></div>
      {#if canLearn}
        <button type="button" onclick={() => setFinished(!content?.my_status_finished)} class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold {content.my_status_finished ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}">
          {#if content.my_status_finished}<CheckCircle2 size={17} /> Tandai belum selesai{:else}<Circle size={17} /> Tandai selesai{/if}
        </button>
      {/if}
    </div>
  </article>
{/if}
