
import {InjectionToken} from '@angular/core';
import { InsEditableIframeOptions } from '../../common/iframe';


/**
 * Size of resizable iframe inside editor
 */
export const INS_IFRAME_EDITOR_OPTIONS = new InjectionToken<InsEditableIframeOptions>(
    '',
    {
        factory: () => ({
            minWidth: 100,
            maxWidth: Infinity,
            minHeight: 100,
            maxHeight: Infinity,
        }),
    },
);
