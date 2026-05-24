"use client";

import React, { createContext, useContext, useState } from "react";

interface PageTitleContextValue {
  titulo: string;
  setTitulo: (titulo: string) => void;
}

const PageTitleContext = createContext<PageTitleContextValue>({
  titulo: "",
  setTitulo: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [titulo, setTitulo] = useState("");
  return (
    <PageTitleContext.Provider value={{ titulo, setTitulo }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}
