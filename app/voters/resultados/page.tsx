'use client';
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot, faLaptopMedical, faChartColumn, faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from 'next/navigation';
import ResultadosElection from "../../../components/Resultados";



export default function Page() {


  return (
    <div className="flex mt-10 justify-center  bg-gray-100">
      <div className="text-center">
        <ResultadosElection/>
      </div>
    </div>
  );
}
