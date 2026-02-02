
import {InjectionToken} from '@angular/core';
import { InsImageEditorOptions } from '../../common/image';

/**
 * Size of resizable image inside editor
 */
export const INS_IMAGE_EDITOR_OPTIONS = new InjectionToken<InsImageEditorOptions>(
    '',
    {
        factory: () => ({
            minWidth: null,
            maxWidth: Infinity,
        }),
    },
);
