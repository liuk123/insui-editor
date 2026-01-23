import { InjectionToken } from "@angular/core";
import { InsValueTransformer } from "@liuk123/insui";


export const INS_EDITOR_VALUE_TRANSFORMER = new InjectionToken<
    InsValueTransformer<string | null>
>('');
