
import {InjectionToken} from '@angular/core';
import { InsHandler } from '@liuk123/insui';
import {type Observable} from 'rxjs';
import { InsEditorAttachedFile, InsEditorAttachOptions } from './attached';


/**
 * files loader options
 */
export const INS_ATTACH_FILES_OPTIONS: InjectionToken<InsEditorAttachOptions> =
    new InjectionToken<InsEditorAttachOptions>(
        '',
        {
            factory: () => ({accept: '*/*', multiple: true}),
        },
    );

/**
 * files loader handler
 */
export const INS_ATTACH_FILES_LOADER: InjectionToken<
    InsHandler<File[], Observable<InsEditorAttachedFile[]>>
> = new InjectionToken<InsHandler<File[], Observable<InsEditorAttachedFile[]>>>(
    '',
);
