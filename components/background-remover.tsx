"use client";

import JSZip from "jszip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ACCEPTED_MIME_TYPES,
  APP_ERROR_MESSAGES,
  DEFAULT_MAX_FILE_SIZE,
  MAX_FILES,
  SIZE_PRESETS,
  type AppErrorCode,
  type BackgroundMode,
  type SizePreset,
} from "@/lib/constants";
import { fileFingerprint, validateFile, validateFileCount } from "@/lib/file-validation";
import { downloadBlob, outputFileName, renderOutput } from "@/lib/client/image-processing";
import { DownloadIcon, RetryIcon, SparkleIcon, TrashIcon, UploadIcon } from "@/components/icons";

type JobStatus = "waiting" | "processing" | "success" | "failed";

type ImageJob = {
  id: string;
  fingerprint: string;
  file: File;
  sourceUrl: string;
  status: JobStatus;
  transparentBlob?: Blob;
  errorCode?: AppErrorCode;
  errorMessage?: string;
};

type BackgroundRemoverProps = {
  getTurnstileToken: () => Promise<string>;
  turnstileReady: boolean;
};

const ACCEPT_ATTRIBUTE = ACCEPTED_MIME_TYPES.join(",");

async function readApiError(response: Response) {
  try {
    const error = (await response.json()) as { code?: AppErrorCode; message?: string };
    const code = error.code ?? "PROCESSING_FAILED";
    return { code, message: error.message ?? APP_ERROR_MESSAGES[code] };
  } catch {
    return { code: "PROCESSING_FAILED" as const, message: APP_ERROR_MESSAGES.PROCESSING_FAILED };
  }
}

function formatBytes(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function BackgroundRemover({ getTurnstileToken, turnstileReady }: BackgroundRemoverProps) {
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [background, setBackground] = useState<BackgroundMode>("white");
  const [preset, setPreset] = useState<SizePreset>("original");
  const [notice, setNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [completionToast, setCompletionToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const jobsRef = useRef(jobs);
  const runningRef = useRef(0);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    return () => jobsRef.current.forEach((job) => URL.revokeObjectURL(job.sourceUrl));
  }, []);

  const completedCount = jobs.filter((job) => job.status === "success").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;
  const activeCount = jobs.filter((job) => job.status === "processing").length;
  const pendingCount = jobs.filter((job) => job.status === "waiting").length;
  const hasActiveWork = activeCount > 0;
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!jobs.some((job) => job.status === "success" || job.status === "processing")) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [jobs]);

  const addFiles = useCallback((incoming: File[]) => {
    setNotice(null);
    const current = jobsRef.current;
    const countValidation = validateFileCount(current.length, incoming.length);
    if (!countValidation.ok) {
      setNotice(countValidation.message);
      return;
    }

    const fingerprints = new Set(current.map((job) => job.fingerprint));
    const additions: ImageJob[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      const validation = validateFile(file, DEFAULT_MAX_FILE_SIZE);
      if (!validation.ok) {
        errors.push(validation.message);
        continue;
      }

      const fingerprint = fileFingerprint(file);
      if (fingerprints.has(fingerprint)) continue;
      fingerprints.add(fingerprint);
      additions.push({
        id: crypto.randomUUID(),
        fingerprint,
        file,
        sourceUrl: URL.createObjectURL(file),
        status: "waiting",
      });
    }

    if (errors.length) setNotice(errors.join(" "));
    if (additions.length) {
      setSelectedJobId((currentId) => currentId ?? additions[0].id);
      setJobs((items) => [...items, ...additions]);
    }
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<ImageJob>) => {
    setJobs((items) => items.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }, []);

  const processJob = useCallback(
    async (job: ImageJob) => {
      updateJob(job.id, { status: "processing", errorCode: undefined, errorMessage: undefined });
      runningRef.current += 1;

      try {
        const turnstileToken = await getTurnstileToken();
        const formData = new FormData();
        formData.append("image", job.file, job.file.name);
        formData.append("turnstileToken", turnstileToken);

        const response = await fetch("/api/remove-background", {
          method: "POST",
          body: formData,
          cache: "no-store",
        });

        if (!response.ok) {
          const error = await readApiError(response);
          updateJob(job.id, {
            status: "failed",
            errorCode: error.code,
            errorMessage: error.message,
          });
          return;
        }

        const transparentBlob = await response.blob();
        updateJob(job.id, { status: "success", transparentBlob });
        setSelectedJobId(job.id);
        setCompletionToast(`${job.file.name} is ready to download.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : APP_ERROR_MESSAGES.PROCESSING_FAILED;
        updateJob(job.id, { status: "failed", errorCode: "PROCESSING_FAILED", errorMessage: message });
      } finally {
        runningRef.current -= 1;
      }
    },
    [getTurnstileToken, updateJob],
  );

  useEffect(() => {
    if (!turnstileReady) return;
    const available = Math.max(0, 2 - runningRef.current);
    if (available === 0) return;
    const waiting = jobs.filter((job) => job.status === "waiting").slice(0, available);
    waiting.forEach((job) => void processJob(job));
  }, [jobs, processJob, turnstileReady]);

  useEffect(() => {
    if (!completionToast) return;
    const timeout = window.setTimeout(() => setCompletionToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [completionToast]);

  const removeJob = (id: string) => {
    const job = jobsRef.current.find((item) => item.id === id);
    if (!job || job.status === "processing") return;
    URL.revokeObjectURL(job.sourceUrl);
    setJobs((items) => items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    if (hasActiveWork) return;
    jobsRef.current.forEach((job) => URL.revokeObjectURL(job.sourceUrl));
    setJobs([]);
    setSelectedJobId(null);
    setNotice(null);
  };

  const retryJob = (id: string) => updateJob(id, { status: "waiting", errorCode: undefined, errorMessage: undefined });

  const getOutput = useCallback(
    async (job: ImageJob) => {
      if (!job.transparentBlob) throw new Error("The processed image is unavailable.");
      return renderOutput(job.transparentBlob, background, preset);
    },
    [background, preset],
  );

  const downloadSingle = async (job: ImageJob) => {
    try {
      downloadBlob(await getOutput(job), outputFileName(job.file.name));
    } catch {
      setNotice("Could not create the download. Try this image again.");
    }
  };

  const downloadZip = async () => {
    const successful = jobs.filter((job) => job.status === "success" && job.transparentBlob);
    if (!successful.length) return;

    setIsZipping(true);
    setNotice(null);
    try {
      const zip = new JSZip();
      for (const job of successful) {
        zip.file(outputFileName(job.file.name), await getOutput(job));
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "background-removed-images.zip");
    } catch {
      setNotice("Could not build the ZIP file. Download images individually instead.");
    } finally {
      setIsZipping(false);
    }
  };

  const progressLabel = useMemo(() => {
    if (!jobs.length) return "No images added";
    return `${completedCount + failedCount} of ${jobs.length} complete`;
  }, [completedCount, failedCount, jobs.length]);

  return (
    <section id="tool" className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 sm:p-8 lg:p-10">
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept={ACCEPT_ATTRIBUTE}
              multiple
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />

            {selectedJob ? (
              <PrimaryResult
                job={selectedJob}
                background={background}
                preset={preset}
                progressLabel={progressLabel}
                onChooseMore={() => inputRef.current?.click()}
                onDownload={() => void downloadSingle(selectedJob)}
                onRetry={() => retryJob(selectedJob.id)}
              />
            ) : (
              <div
                className={`relative flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border-2 border-dashed px-6 py-12 text-center transition ${
                  isDragging ? "border-violet-500 bg-violet-50" : "border-slate-300 bg-slate-50/70 hover:border-violet-400 hover:bg-violet-50/50"
                }`}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget === event.target) setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  addFiles(Array.from(event.dataTransfer.files));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload product images"
              >
                <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                  <UploadIcon className="size-7" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Drop product photos here</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  JPG, PNG or WebP. Up to {MAX_FILES} images, 10 MB each. Your files are not stored by this site.
                </p>
                <span className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
                  Choose images
                </span>
              </div>
            )}

            {notice && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900" role="alert">
                {notice}
              </div>
            )}
          </div>

          <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
              <SparkleIcon className="size-4" /> Output settings
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-medium text-slate-300">Background</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["white", "transparent"] as BackgroundMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBackground(mode)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      background === mode
                        ? "border-violet-400 bg-violet-500/20 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
                    }`}
                    aria-pressed={background === mode}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`size-5 rounded-md border ${mode === "white" ? "bg-white" : "checkerboard"}`} />
                      {mode === "white" ? "White" : "Transparent"}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-medium text-slate-300">Canvas preset</legend>
              <div className="mt-3 space-y-2">
                {(Object.keys(SIZE_PRESETS) as SizePreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreset(key)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      preset === key
                        ? "border-violet-400 bg-violet-500/20"
                        : "border-slate-700 bg-slate-900 hover:border-slate-500"
                    }`}
                    aria-pressed={preset === key}
                  >
                    <span className="text-sm font-semibold text-white">{SIZE_PRESETS[key].label}</span>
                    <span className="text-xs text-slate-400">{SIZE_PRESETS[key].description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <p className="mt-7 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs leading-5 text-slate-400">
              Changing these settings re-renders completed images in your browser. It does not spend another Remove.bg credit.
            </p>
          </aside>
        </div>

        {jobs.length > 1 && (
          <div className="border-t border-slate-200 bg-white px-5 py-6 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950">Processing queue</p>
                <p className="mt-1 text-sm text-slate-500" aria-live="polite">
                  {progressLabel}{pendingCount > 0 ? ` · ${pendingCount} waiting` : ""}{activeCount > 0 ? ` · ${activeCount} processing` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={hasActiveWork}
                  onClick={clearAll}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  disabled={completedCount === 0 || isZipping}
                  onClick={() => void downloadZip()}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <DownloadIcon className="size-4" />
                  {isZipping ? "Building ZIP…" : `Download ZIP (${completedCount})`}
                </button>
              </div>
            </div>

            {!turnstileReady && (
              <p className="mt-4 text-sm text-slate-500">Loading secure verification before processing starts…</p>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  background={background}
                  preset={preset}
                  selected={job.id === selectedJob?.id}
                  onSelect={() => setSelectedJobId(job.id)}
                  onRemove={() => removeJob(job.id)}
                  onRetry={() => retryJob(job.id)}
                  onDownload={() => void downloadSingle(job)}
                />
              ))}
            </div>

            {(failedCount > 0 || completedCount > 0) && (
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {completedCount} successful · {failedCount} failed. ZIP downloads include successful images only.
                </p>
                {completedCount > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    Was the result useful?
                    <a href="https://github.com/midMoonNight/image-background-remover/issues/new?title=Good%20result&body=The%20result%20worked%20well%20for%20my%20product%20photos." className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100">Good result</a>
                    <a href="https://github.com/midMoonNight/image-background-remover/issues/new?title=Needs%20improvement&body=Describe%20the%20type%20of%20product%20and%20what%20went%20wrong.%20Please%20do%20not%20attach%20private%20images%20unless%20you%20intend%20to%20share%20them." className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100">Needs improvement</a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {completionToast && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)]" role="status" aria-live="polite">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">✓</span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-950">Background removed</p>
            <p className="truncate text-sm text-slate-500">{completionToast}</p>
          </div>
          <button type="button" onClick={() => setCompletionToast(null)} className="ml-2 text-lg text-slate-400 hover:text-slate-700" aria-label="Dismiss notification">×</button>
        </div>
      )}
    </section>
  );
}

function PrimaryResult({
  job,
  background,
  preset,
  progressLabel,
  onChooseMore,
  onDownload,
  onRetry,
}: {
  job: ImageJob;
  background: BackgroundMode;
  preset: SizePreset;
  progressLabel: string;
  onChooseMore: () => void;
  onDownload: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{job.file.name}</p>
          <p className={`mt-0.5 text-xs font-medium ${job.status === "success" ? "text-emerald-600" : job.status === "failed" ? "text-rose-600" : "text-violet-600"}`}>
            {job.status === "success" ? "Result ready" : job.status === "failed" ? "Processing failed" : job.status === "processing" ? "Removing background…" : "Waiting to process"}
          </p>
        </div>
        <button type="button" onClick={onChooseMore} className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300">
          + Add images
        </button>
      </div>

      <div className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6 sm:p-8 ${background === "transparent" && job.status === "success" ? "checkerboard" : "bg-white"}`}>
        {job.status === "success" && job.transparentBlob ? (
          <ProcessedPreview blob={job.transparentBlob} background={background} preset={preset} large />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={job.sourceUrl} alt="Original upload" className="max-h-[22rem] max-w-full object-contain opacity-45 blur-[1px]" />
            <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-sm">
              {job.status === "failed" ? (
                <div className="max-w-xs text-center">
                  <p className="font-semibold text-rose-700">We could not process this image.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{job.errorMessage}</p>
                  <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"><RetryIcon className="size-4" /> Retry</button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="mx-auto block size-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                  <p className="mt-4 font-semibold text-slate-950">Removing the background</p>
                  <p className="mt-1 text-sm text-slate-500">{progressLabel}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {job.status === "success" && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-semibold text-slate-950">Your image is ready</p>
            <p className="text-xs text-slate-500">{SIZE_PRESETS[preset].label} · {background === "white" ? "White background" : "Transparent background"}</p>
          </div>
          <button type="button" onClick={onDownload} className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500">
            <DownloadIcon className="size-4" /> Download PNG
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  background,
  preset,
  selected,
  onSelect,
  onRemove,
  onRetry,
  onDownload,
}: {
  job: ImageJob;
  background: BackgroundMode;
  preset: SizePreset;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onRetry: () => void;
  onDownload: () => void;
}) {
  return (
    <article className={`flex min-w-0 gap-4 rounded-2xl border p-3 transition ${selected ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
        {/* Local object URLs avoid sending preview images to any optimizer or storage. */}
        {job.status === "success" && job.transparentBlob ? (
          <ProcessedPreview blob={job.transparentBlob} background={background} preset={preset} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.sourceUrl} alt="" className="size-full bg-white object-contain" />
        )}
        {job.status === "processing" && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/60">
            <span className="size-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-1">
        <p className="truncate text-sm font-semibold text-slate-950" title={job.file.name}>{job.file.name}</p>
        <p className="mt-1 text-xs text-slate-500">{formatBytes(job.file.size)}</p>
        <StatusLine job={job} />
        <div className="mt-3 flex flex-wrap gap-2">
          {!selected && (
            <button type="button" onClick={onSelect} className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50">
              View result
            </button>
          )}
          {job.status === "success" && (
            <button type="button" onClick={onDownload} className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
              <DownloadIcon className="size-3.5" /> Download
            </button>
          )}
          {job.status === "failed" && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500">
              <RetryIcon className="size-3.5" /> Retry
            </button>
          )}
          {job.status !== "processing" && (
            <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300">
              <TrashIcon className="size-3.5" /> Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ProcessedPreview({
  blob,
  background,
  preset,
  large = false,
}: {
  blob: Blob;
  background: BackgroundMode;
  preset: SizePreset;
  large?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | null = null;

    void renderOutput(blob, background, preset).then((output) => {
      if (disposed) return;
      objectUrl = URL.createObjectURL(output);
      setPreviewUrl(objectUrl);
    });

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [background, blob, preset]);

  if (!previewUrl) {
    return <div className="size-full animate-pulse bg-slate-200" aria-label="Building preview" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={previewUrl} alt="Processed result" className={`${large ? "max-h-[24rem] max-w-full" : "size-full"} object-contain ${background === "transparent" ? "checkerboard" : "bg-white"}`} />
  );
}

function StatusLine({ job }: { job: ImageJob }) {
  if (job.status === "failed") {
    return <p className="mt-2 text-xs leading-5 text-rose-600" role="alert">{job.errorMessage}</p>;
  }

  const labels: Record<Exclude<JobStatus, "failed">, string> = {
    waiting: "Waiting for secure processing",
    processing: "Removing background…",
    success: "Ready to download",
  };
  const colors: Record<Exclude<JobStatus, "failed">, string> = {
    waiting: "text-slate-500",
    processing: "text-violet-600",
    success: "text-emerald-600",
  };
  return <p className={`mt-2 text-xs font-medium ${colors[job.status]}`}>{labels[job.status]}</p>;
}
