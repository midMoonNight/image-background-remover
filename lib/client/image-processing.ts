import { SIZE_PRESETS, type BackgroundMode, type SizePreset } from "@/lib/constants";

const SUBJECT_FILL_RATIO = 0.88;

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode the processed image."));
    };
    image.src = url;
  });
}

export async function renderOutput(
  transparentBlob: Blob,
  background: BackgroundMode,
  preset: SizePreset,
): Promise<Blob> {
  if (background === "transparent" && preset === "original") return transparentBlob;

  const image = await loadImage(transparentBlob);
  const target = SIZE_PRESETS[preset];
  const width = target.width ?? image.naturalWidth;
  const height = target.height ?? image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");

  if (background === "white") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  const maxWidth = preset === "original" ? width : width * SUBJECT_FILL_RATIO;
  const maxHeight = preset === "original" ? height : height * SUBJECT_FILL_RATIO;
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.drawImage(image, x, y, drawWidth, drawHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the output image."))),
      "image/png",
    );
  });
}

export function outputFileName(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  return `${base}-removed.png`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
