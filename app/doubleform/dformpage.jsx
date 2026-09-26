'use client';
import Formdcalc from '@/components/Homepagecomp/Formdcalc';
import { useSearchParams } from 'next/navigation'


export default function Dformpage() {

    const params = useSearchParams();    
    const slug = params.get('slug');

  return (
  <Formdcalc
    slug={slug}
  />
  
  );
}
