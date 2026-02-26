import {Directive, signal} from '@angular/core';
import { InsButton, insButtonOptionsProvider } from '@liuk123/insui';

@Directive({
    selector: 'button[ins-toolbar-button-tool]',
    standalone: true,
    providers: [
        insButtonOptionsProvider({
            size: 'm',
            appearance: 'icon',
        }),
    ],
    hostDirectives: [
        {
            directive: InsButton,
            inputs: ['size'],
        },
    ],
    host: {
        insItem: '',
        insToolbarTool: '',
        insButton: '',
        type: 'button',
        '[disabled]': 'disabled()',
    },
})
export class InsToolbarButtonTool {
    public readonly disabled = signal<boolean>(false);
}
