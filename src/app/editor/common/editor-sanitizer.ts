
import {InjectionToken, type Sanitizer} from '@angular/core';

export const INS_EDITOR_SANITIZER = new InjectionToken<Sanitizer | null>(
     '',
    {
        factory: () => null,
    },
);
