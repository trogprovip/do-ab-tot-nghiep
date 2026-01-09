'use client';

import React from 'react';
import CGVHeader from '@/components/cgv/CGVHeader';
import HeroBanner from '@/components/cgv/HeroBanner';
import MovieSelection from '@/components/cgv/MovieSelection';
import EventSection from '@/components/cgv/EventSection';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function CGVHomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <CGVHeader />
      <main>
        <HeroBanner />
        <MovieSelection />
        <EventSection />
      </main>
      <CGVFooter />
    </div>
  );
}
