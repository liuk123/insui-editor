import { DestroyRef, inject, InjectionToken, type Provider } from '@angular/core';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Doc } from 'yjs';

export interface InsEditorCollaborationUser {
  readonly name: string;
  readonly color: string;
}

const DEFAULT_COLLABORATION_USER: InsEditorCollaborationUser = {
  name: 'Anonymous',
  color: '#5B8FF9',
};

export interface InsEditorCollaborationConfig {
  readonly enabled: boolean;
  readonly documentName: string;
  readonly field: string;
  readonly user: InsEditorCollaborationUser;
  readonly document: Doc | null;
  readonly provider: HocuspocusProvider | null;
}

export interface InsEditorCollaborationSetup {
  readonly enabled?: boolean;
  readonly documentName: string;
  readonly field?: string;
  readonly user?: Partial<InsEditorCollaborationUser>;
  readonly url: string;
}

export const INS_EDITOR_COLLABORATION_USER = new InjectionToken<InsEditorCollaborationUser>(
  '[INS_EDITOR_COLLABORATION_USER]',
  {
    factory: () => DEFAULT_COLLABORATION_USER,
  },
);

export const INS_EDITOR_COLLABORATION = new InjectionToken<InsEditorCollaborationConfig>(
  '[INS_EDITOR_COLLABORATION]',
  {
    factory: () => ({
      enabled: false,
      documentName: 'default',
      field: 'default',
      user: DEFAULT_COLLABORATION_USER,
      document: null,
      provider: null,
    }),
  },
);

export function provideInsEditorCollaborationUser(user: InsEditorCollaborationUser): Provider {
  return {
    provide: INS_EDITOR_COLLABORATION_USER,
    useValue: user,
  };
}

export function provideInsEditorCollaboration(setup: InsEditorCollaborationSetup): Provider {
  return {
    provide: INS_EDITOR_COLLABORATION,
    useFactory: (): InsEditorCollaborationConfig => {
      const destroyRef = inject(DestroyRef);
      const injectedUser = inject(INS_EDITOR_COLLABORATION_USER, { optional: true });
      const enabled = setup.enabled ?? true;
      const resolvedUser: InsEditorCollaborationUser = {
        name: setup.user?.name ?? injectedUser?.name ?? DEFAULT_COLLABORATION_USER.name,
        color: setup.user?.color ?? injectedUser?.color ?? DEFAULT_COLLABORATION_USER.color,
      };

      if (!enabled) {
        return {
          enabled: false,
          documentName: setup.documentName,
          field: setup.field ?? 'default',
          user: resolvedUser,
          document: null,
          provider: null,
        };
      }

      const document = new Doc();
      const provider = new HocuspocusProvider({
        url: setup.url,
        name: setup.documentName,
        document,
      });

      destroyRef.onDestroy(() => {
        provider.destroy();
        document.destroy();
      });

      return {
        enabled: true,
        documentName: setup.documentName,
        field: setup.field ?? 'default',
        user: resolvedUser,
        document,
        provider,
      };
    },
  };
}
