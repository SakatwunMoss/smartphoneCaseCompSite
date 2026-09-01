import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public/favicon-source.png");

const OUTPUTS = {
  publicDir: path.join(ROOT, "public"),
  appDir: path.join(ROOT, "src/app"),
} as const;

type IconSpec = {
  name: string;
  size: number;
  tightCrop: boolean;
  sharpen: boolean;
};

const ICON_SPECS: IconSpec[] = [
  { name: "favicon-16x16.png", size: 16, tightCrop: true, sharpen: true },
  { name: "favicon-32x32.png", size: 32, tightCrop: true, sharpen: true },
  { name: "icon.png", size: 32, tightCrop: true, sharpen: true },
  { name: "apple-touch-icon.png", size: 180, tightCrop: false, sharpen: false },
  { name: "apple-icon.png", size: 180, tightCrop: false, sharpen: false },
];

function createIcoFromPngs(
  images: Array<{ size: number; data: Buffer }>,
): Buffer {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries: Buffer[] = [];
  const payloads: Buffer[] = [];

  for (const { size, data } of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.byteLength, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    payloads.push(data);
    offset += data.byteLength;
  }

  return Buffer.concat([header, ...entries, ...payloads]);
}

async function buildSquareSource(
  source: Buffer,
  tightCrop: boolean,
): Promise<Buffer> {
  const image = sharp(source);
  const { width = 0, height = 0 } = await image.metadata();
  const side = Math.min(width, height);
  const left = Math.floor((width - side) / 2);
  const top = Math.floor((height - side) / 2);

  let pipeline = sharp(source).extract({ left, top, width: side, height: side });

  if (tightCrop) {
    const inset = Math.floor(side * 0.12);
    const croppedSide = side - inset * 2;
    pipeline = pipeline.extract({
      left: inset,
      top: inset,
      width: croppedSide,
      height: croppedSide,
    });
  }

  return pipeline.ensureAlpha().png().toBuffer();
}

async function renderIcon(
  source: Buffer,
  { size, tightCrop, sharpen }: Pick<IconSpec, "size" | "tightCrop" | "sharpen">,
): Promise<Buffer> {
  const square = await buildSquareSource(source, tightCrop);
  let pipeline = sharp(square).resize(size, size, {
    fit: "contain",
    background: { r: 198, g: 92, b: 44, alpha: 1 },
    kernel: sharp.kernel.lanczos3,
  });

  if (sharpen) {
    pipeline = pipeline.sharpen({ sigma: 0.8, m1: 0.5, m2: 0.25, x1: 2, y2: 10 });
  }

  return pipeline.ensureAlpha().png({ compressionLevel: 9 }).toBuffer();
}

async function main() {
  const source = await readFile(SOURCE);
  await mkdir(OUTPUTS.publicDir, { recursive: true });
  await mkdir(OUTPUTS.appDir, { recursive: true });

  const rendered = new Map<string, Buffer>();

  for (const spec of ICON_SPECS) {
    const png = await renderIcon(source, spec);
    rendered.set(spec.name, png);
  }

  const publicFiles = ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png"] as const;
  for (const name of publicFiles) {
    const png = rendered.get(name);
    if (!png) throw new Error(`Missing rendered icon: ${name}`);
    await writeFile(path.join(OUTPUTS.publicDir, name), png);
  }

  const iconPng = rendered.get("icon.png");
  const applePng = rendered.get("apple-icon.png");
  if (!iconPng || !applePng) throw new Error("Missing app icon renders");

  await writeFile(path.join(OUTPUTS.appDir, "icon.png"), iconPng);
  await writeFile(path.join(OUTPUTS.appDir, "apple-icon.png"), applePng);

  const icoSizes = [16, 32, 48] as const;
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      data: await renderIcon(source, {
        size,
        tightCrop: size <= 32,
        sharpen: size <= 32,
      }),
    })),
  );

  const ico = createIcoFromPngs(icoImages);
  await writeFile(path.join(OUTPUTS.publicDir, "favicon.ico"), ico);
  await writeFile(path.join(OUTPUTS.appDir, "favicon.ico"), ico);

  console.log("Generated favicon assets:");
  for (const name of [...publicFiles, "favicon.ico"]) {
    console.log(`  public/${name}`);
  }
  console.log("  src/app/favicon.ico");
  console.log("  src/app/icon.png");
  console.log("  src/app/apple-icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
