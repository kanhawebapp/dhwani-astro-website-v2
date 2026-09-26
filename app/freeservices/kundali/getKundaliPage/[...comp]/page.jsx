'use client';

import { useParams } from "next/navigation";
import Basichart from "@/components/Kundli/Kundliinter/Basichart";

import Matchkuinter from "@/components/Kundli/Kundliinter/Matchkundli/KundliMilanPage";


export default function Kundlipage() {
  const params = useParams();
  const path = (params.comp || []).map((p) => p.toLowerCase());

  if (!path || path.length === 0) {
    return <div>Invalid URL structure</div>;
  }

  const handleSubmit = (formData) => {
  };

  // Component references
  const kundliinteral = {
    kundlibasic1: Basichart,
 
    matchkundli: Matchkuinter, 
   
  };


  const matchkundliinter = {
    matchkundli: Matchkuinter,
  };

  let ComponentRef = null;
  let componentProps = {}; 

  if (path.length === 1) {
    ComponentRef = kundliinteral[path[0]];
    if (path[0] === "matchkundli") {
      componentProps.handleSubmit = handleSubmit;
    }
  } else if (path.length === 2 && path[0] === "westernpage") {
    ComponentRef = westerninter[path[1]];
  } else if (path.length === 2 && path[0] === "matchhoro") {
    ComponentRef = matchkundliinter[path[1]];
    componentProps.handleSubmit = handleSubmit;
  }

  return ComponentRef ? (
    <ComponentRef {...componentProps} />
  ) : (
    <div className="text-center text-red-600 font-semibold py-10">
      Page not found: <code>{path.join(" / ")}</code>
    </div>
  );
}