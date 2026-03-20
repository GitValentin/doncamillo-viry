'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  UtensilsCrossed,
} from 'lucide-react';
import Image from 'next/image';
import type { FlipbookPage, MenuItem, EstablishmentInfo } from '@/lib/types';
import { urlFor } from '@/sanity/lib/image';

interface MenuGridProps {
  pages: FlipbookPage[];
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function formatPrice(prix: number): string {
  return prix.toFixed(2).replace('.', ',') + ' €';
}

/* ------------------------------------------------------------------ */
/*  Card sub-components                                                */
/* ------------------------------------------------------------------ */

function CoverCard({ info }: { info: EstablishmentInfo }) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center md:py-16">
      <span className="mb-4 text-5xl select-none" aria-hidden>
        🍕
      </span>

      <h1 className="font-serif text-4xl font-bold tracking-tight text-dc-charcoal md:text-5xl">
        Don Camillo&apos;s
      </h1>
      <p className="mt-1 font-serif text-2xl font-light italic text-dc-gold">
        Pizza
      </p>

      <div className="my-6 h-px w-20 bg-dc-gold" />

      <ul className="flex flex-col gap-2.5 text-sm text-dc-charcoal/65 md:flex-row md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-2">
        <li className="flex items-center justify-center gap-2">
          <MapPin size={14} className="shrink-0 text-dc-gold" />
          <span>{info.adresse}</span>
        </li>
        <li className="flex items-center justify-center gap-2">
          <Phone size={14} className="shrink-0 text-dc-gold" />
          <span>{info.telephone}</span>
        </li>
        <li className="flex items-center justify-center gap-2">
          <Clock size={14} className="shrink-0 text-dc-gold" />
          <span>{info.horaires}</span>
        </li>
        <li className="flex items-center justify-center gap-2">
          <UtensilsCrossed size={14} className="shrink-0 text-dc-gold" />
          <span>{info.specificites}</span>
        </li>
      </ul>
    </div>
  );
}

function SectionCard({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center px-8 py-10 text-center">
      <div className="flex items-center gap-4">
        <span className="block h-px w-10 bg-dc-gold" />
        <span className="text-[10px] font-bold tracking-[0.4em] text-dc-gold uppercase">
          Catégorie
        </span>
        <span className="block h-px w-10 bg-dc-gold" />
      </div>

      <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-dc-charcoal">
        {title}
      </h2>

      <div className="mt-4 h-1 w-14 rounded-full bg-dc-gold" />
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Image — square aspect ratio */}
      <div className="relative mx-4 mt-4 aspect-square shrink-0 overflow-hidden rounded-lg border-2 border-dc-gold/25 bg-dc-charcoal/[0.03]">
        {item.image && !imgError ? (
          <Image
            src={urlFor(item.image).width(400).height(400).url()}
            alt={item.nom}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl opacity-30 select-none">🍕</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.06] to-transparent" />

        {item.fait_maison && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-dc-red px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            🏠 Fait Maison
          </span>
        )}
      </div>

      {/* Details — flex-1 + min-h-0 for line-clamp, mt-auto pins price to bottom */}
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className="font-serif text-base font-bold leading-tight text-dc-charcoal md:text-lg">
          {item.nom}
        </h3>

        <div className="mt-2 h-px w-10 shrink-0 bg-dc-gold/50" />

        <p className="mt-2 min-h-0 flex-1 text-sm leading-relaxed text-dc-charcoal/55 line-clamp-3">
          {item.composition}
        </p>

        <div className="mt-auto shrink-0 pt-3">
          {item.prix != null ? (
            <span className="font-serif text-lg font-bold text-dc-red">
              {formatPrice(item.prix)}
            </span>
          ) : (
            <div className="flex flex-col gap-0.5 text-sm">
              {item.prix_a_emporter != null && (
                <span className="text-dc-charcoal/65">
                  À emporter :{' '}
                  <strong className="text-dc-red">
                    {formatPrice(item.prix_a_emporter)}
                  </strong>
                </span>
              )}
              {item.prix_sur_place != null && (
                <span className="text-dc-charcoal/65">
                  Sur place :{' '}
                  <strong className="text-dc-red">
                    {formatPrice(item.prix_sur_place)}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid shell                                                         */
/* ------------------------------------------------------------------ */

export default function MenuGrid({ pages }: MenuGridProps) {
  const [activeSectionIdx, setActiveSectionIdx] = useState(-1);

  const sectionIndices = pages
    .map((p, i) => (p.type === 'section' ? i : -1))
    .filter((i) => i !== -1);

  /* Track which section header is closest to the top of the viewport */
  useEffect(() => {
    const sectionEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section-idx]'),
    );
    if (sectionEls.length === 0) return;

    const onScroll = () => {
      const threshold = window.innerHeight * 0.3;
      let active = -1;
      for (const el of sectionEls) {
        if (el.getBoundingClientRect().top <= threshold) {
          active = Number(el.dataset.sectionIdx);
        }
      }
      setActiveSectionIdx(active);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activePage =
    activeSectionIdx >= 0 ? pages[activeSectionIdx] : null;
  const sectionTitle =
    activePage?.type === 'section' ? activePage.title : '';
  const currentPos = sectionIndices.indexOf(activeSectionIdx);

  const scrollToSection = (dir: number) => {
    const sectionEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section-idx]'),
    );

    if (dir < 0 && currentPos <= 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nextPos = currentPos + dir;
    if (nextPos < 0 || nextPos >= sectionEls.length) return;

    sectionEls[nextPos].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Responsive card grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pt-6 pb-24 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {pages.map((page, i) => {
          const fullWidth = page.type !== 'item';

          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className={`${fullWidth ? 'col-span-full' : ''} ${
                page.type === 'section' ? 'scroll-mt-4' : ''
              }`}
              data-section-idx={
                page.type === 'section' ? i : undefined
              }
            >
              <div
                className={`overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(26,26,26,0.07),0_1.5px_6px_rgba(26,26,26,0.04)] ${
                  fullWidth ? '' : 'h-full'
                }`}
              >
                {page.type === 'cover' && <CoverCard info={page.info} />}
                {page.type === 'section' && (
                  <SectionCard title={page.title} />
                )}
                {page.type === 'item' && <ItemCard item={page.item} />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fixed bottom navigation — jumps between section headers */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-dc-gold/10 bg-white/80 backdrop-blur-xl"
        aria-label="Navigation du menu"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => scrollToSection(-1)}
            disabled={activeSectionIdx < 0}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-dc-gold text-dc-charcoal transition-colors hover:bg-dc-gold disabled:border-dc-charcoal/10 disabled:text-dc-charcoal/20 disabled:hover:bg-transparent"
            aria-label="Section précédente"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="mx-4 truncate text-center text-sm font-medium tracking-wide text-dc-charcoal/55">
            {sectionTitle || 'La Carte'}
          </span>

          <button
            onClick={() => scrollToSection(1)}
            disabled={currentPos >= sectionIndices.length - 1}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-dc-gold text-dc-charcoal transition-colors hover:bg-dc-gold disabled:border-dc-charcoal/10 disabled:text-dc-charcoal/20 disabled:hover:bg-transparent"
            aria-label="Section suivante"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </nav>
    </>
  );
}
