import { Routes } from "@angular/router";
import { Tiptap } from "./views/tiptap/tiptap";



export const routes: Routes = [
  {
    path: 'tiptap',
    component: Tiptap,
    data: {
      keep: true,
      meta: {
        title: "tiptap",
        keywords: "tiptap",
      }
    }
  },
  { path: '', redirectTo: '/editor-demo/tiptap', pathMatch: 'full' },
]