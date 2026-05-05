import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type StoredFile = {
  url: string;
  absolutePath: string;
};

export interface StorageProvider {
  put(buffer: Buffer, key: string, contentType: string): Promise<StoredFile>;
}

class LocalStorageProvider implements StorageProvider {
  private root = process.env.LOCAL_STORAGE_ROOT
    ? path.resolve(/* turbopackIgnore: true */ process.env.LOCAL_STORAGE_ROOT)
    : path.join(process.cwd(), "storage", "uploads");

  async put(buffer: Buffer, key: string, contentType: string) {
    void contentType;
    const cleanKey = key.replaceAll("\\", "/").replace(/^\/+/, "");
    const absolutePath = path.join(this.root, cleanKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);
    return {
      absolutePath,
      url: `/api/uploads/${cleanKey}`,
    };
  }
}

export function getStorageProvider(): StorageProvider {
  return new LocalStorageProvider();
}
