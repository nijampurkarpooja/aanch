// Spike R4: throwaway upload page, never merged.
import { Uploader } from "./uploader";

export const metadata = { robots: { index: false } };

export default function R4Page() {
  return (
    <main>
      <h1>R4 upload</h1>
      <Uploader />
    </main>
  );
}
