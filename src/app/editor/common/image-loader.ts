
import {InjectionToken} from '@angular/core';
import { InsHandler } from '@liuk123/insui';
import {fromEvent, map, type Observable} from 'rxjs';

/**
 * Image loader handler
 */
export const INS_IMAGE_LOADER: InjectionToken<
    InsHandler<Blob | File, Observable<string>>
> = new InjectionToken<InsHandler<Blob | File, Observable<string>>>(
    '',
    {
        factory: () => (file) => {
            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);

            return fromEvent(fileReader, 'load').pipe(
                map(() => String(fileReader.result)),
            );
        },
    },
);
