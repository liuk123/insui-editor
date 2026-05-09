
import {InjectionToken} from '@angular/core';
import {type Editor} from '@tiptap/core';
import {type Observable, ReplaySubject} from 'rxjs';

/**
 * Token for Tiptap Editor
 */
export const TIPTAP_EDITOR = new InjectionToken<Observable<Editor>>(
    '',
);

/**
 * Lazy loaded Editor
 */
export const LAZY_TIPTAP_EDITOR = new InjectionToken(
    '',
    {
        factory: () => {
            const editor$ = new ReplaySubject<typeof Editor>(1);

            import('@tiptap/core')
                .then(({Editor}) => editor$.next(Editor))
                .catch((err) => {
                  console.log('Failed to load Tiptap Editor', err);
                  console.error(err);
                  editor$.complete()
                });

            return editor$;
        },
    },
);

/**
 * The container in which the tip-tap editor is initialized
 */
export const INITIALIZATION_TIPTAP_CONTAINER = new InjectionToken(
    '',
);
