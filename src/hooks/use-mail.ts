"use client"

import { atom, useAtom } from "jotai"
import type { Mail } from "@/lib/data"

type Config = {
  selected: Mail["id"] | null
}

const configAtom = atom<Config>({
  selected: null,
})

export function useMail() {
  const [config, setConfig] = useAtom(configAtom)

  return {
    selected: config.selected,
    setSelected: (id: Mail["id"] | null) =>
      setConfig({
        ...config,
        selected: id,
      }),
  }
}
