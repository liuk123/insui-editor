import {InjectionToken} from '@angular/core';
import {type Extension, type Mark, type Node} from '@tiptap/core';
import {type Observable} from 'rxjs';

/**
 * Extensions for editor
 */
export const INS_EDITOR_EXTENSIONS = new InjectionToken<
    ReadonlyArray<Promise<Extension | Mark | Node>>
>('');

/**
 * lazy extensions
 */
export const LAZY_EDITOR_EXTENSIONS = new InjectionToken<
    Observable<ReadonlyArray<Extension | Mark | Node>>
>('');
