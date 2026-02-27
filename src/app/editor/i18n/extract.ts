import {inject} from '@angular/core';
import type {Observable} from 'rxjs';
import {map} from 'rxjs';
import { INS_LANGUAGE_EDITOR, InsLanguageEditor } from './language';

export function insExtractI18n<K extends keyof InsLanguageEditor>(
    key: K,
): () => Observable<InsLanguageEditor[K]> {
    return () => inject(INS_LANGUAGE_EDITOR).pipe(map((lang: InsLanguageEditor) => lang[key]));
}
