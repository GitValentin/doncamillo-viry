import { getFlipbookPages } from '@/lib/getMenu';
import MenuGrid from '@/components/MenuGrid';

export default async function Home() {
  const pages = await getFlipbookPages();

  return (
    <main>
      <MenuGrid pages={pages} />
    </main>
  );
}
