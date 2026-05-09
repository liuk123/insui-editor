import { TestBed } from '@angular/core/testing';
import {
  INS_EDITOR_COLLABORATION,
  provideInsEditorCollaboration,
  provideInsEditorCollaborationUser,
} from './editor-collaboration';

describe('editor-collaboration', () => {
  it('should provide disabled collaboration config', () => {
    TestBed.configureTestingModule({
      providers: [
        provideInsEditorCollaboration({
          enabled: false,
          url: 'ws://localhost:1234',
          documentName: 'room-1',
        }),
      ],
    });

    const config = TestBed.inject(INS_EDITOR_COLLABORATION);
    expect(config.enabled).toBeFalse();
    expect(config.document).toBeNull();
    expect(config.provider).toBeNull();
  });

  it('should resolve user from injected collaboration user token', () => {
    TestBed.configureTestingModule({
      providers: [
        provideInsEditorCollaborationUser({
          name: 'Injected User',
          color: '#ff5500',
        }),
        provideInsEditorCollaboration({
          enabled: false,
          url: 'ws://localhost:1234',
          documentName: 'room-2',
        }),
      ],
    });

    const config = TestBed.inject(INS_EDITOR_COLLABORATION);
    expect(config.user.name).toBe('Injected User');
    expect(config.user.color).toBe('#ff5500');
  });
});
