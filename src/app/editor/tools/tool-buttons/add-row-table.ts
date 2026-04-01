import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, TemplateRef, viewChild } from '@angular/core';
import { InsDataList, InsDropdownDirective, InsOptGroup, InsOption, InsTextfield, InsTextfieldDropdownDirective, InsWithDropdownOpen, PolymorpheusContent } from '@liuk123/insui';
import { InsToolbarButtonTool } from '../tool-button';
import { InsToolbarTool } from '../tool';
import { InsLanguageEditor } from '../../i18n/language';

export const InsTableCommands = {
    InsertColumnBefore: 'insertColumnBefore',
    InsertColumnAfter: 'insertColumnAfter',
    InsertRowBefore: 'insertRowBefore',
    InsertRowAfter: 'insertRowAfter',
    DeleteColumn: 'deleteColumn',
    DeleteRow: 'deleteRow',
} as const;

@Component({
    standalone: true,
    selector: 'button[insAddRowTableTool]',
    imports: [AsyncPipe, InsDataList, InsOptGroup, InsOption, InsTextfield],
    template: `
        {{ insHint() }}

        <ng-container *insTextfieldDropdown>
            <ins-data-list>
                @for (group of tableCommandTexts$ | async; let i=$index; track i) {
                <ins-opt-group>
                    @for(item of group; let j = $index; track item){
                    <!-- TODO: remove "magic" numbers i*2+@Directive({standalone: true, and make code more readable-->
                    <button
                        insOption
                        type="button"
                        (click)="onTableOption(item)"
                    >
                        {{ item }}
                    </button>
                    }

                </ins-opt-group>
                }
            </ins-data-list>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [InsToolbarButtonTool, InsDropdownDirective, InsWithDropdownOpen],
})
export class InsAddRowTableButtonTool extends InsToolbarTool {
    private readonly dropdown = inject(InsDropdownDirective);
    protected readonly tableCommandTexts$ = [
        [InsTableCommands.InsertColumnBefore, InsTableCommands.InsertColumnAfter],
        [InsTableCommands.InsertRowBefore, InsTableCommands.InsertRowAfter],
        [InsTableCommands.DeleteColumn, InsTableCommands.DeleteRow],
    ];

    protected tem = viewChild(InsTextfieldDropdownDirective, {read: TemplateRef})
    protected e = effect(()=>{
          this.dropdown.insDropdown = this.tem();
    })

    protected override getDisableState(): boolean {
        return !(this.editor?.isActive('table') ?? false);
    }

    protected getIcon(icons: any): string {
        return icons.addRowTable;
    }

    protected getHint(texts?: InsLanguageEditor['toolbarTools']): string {
        return texts?.rowsColumnsManaging ?? '';
    }

    protected onTableOption(command: string): void {
        const registry: Record<string, () => void> | null = {
            [InsTableCommands.InsertColumnAfter]: () => this.editor?.addColumnAfter(),
            [InsTableCommands.InsertColumnBefore]: () => this.editor?.addColumnBefore(),
            [InsTableCommands.InsertRowAfter]: () => this.editor?.addRowAfter(),
            [InsTableCommands.InsertRowBefore]: () => this.editor?.addRowBefore(),
            [InsTableCommands.DeleteColumn]: () => this.editor?.deleteColumn(),
            [InsTableCommands.DeleteRow]: () => this.editor?.deleteRow(),
        };

        registry[command]?.();
    }
}
