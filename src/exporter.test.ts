import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Exporter, type ExporterView } from './exporter';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

vi.mock('fs', async () => {
    const actual = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actual,
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
    };
});

describe('Exporter', () => {
    let exporter: Exporter;

    beforeEach(() => {
        exporter = new Exporter();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('setExportFormat', () => {
        it('returns true for valid predefined format', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            const result = exporter.setExportFormat('JsonHash');
            expect(result).toBe(true);
        });

        it('handles case-insensitive format names', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            const result = exporter.setExportFormat('JSONHASH');
            expect(result).toBe(true);
        });

        it('returns false for non-existent template', () => {
            vi.mocked(existsSync).mockReturnValue(false);
            
            const result = exporter.setExportFormat('NonExistentFormat');
            expect(result).toBe(false);
        });

        it('sets extension from template config', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            exporter.setExportFormat('JsonHash');
            expect(exporter.getExtension()).toBe('json');
        });

        it('sets xml extension for XML format', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            exporter.setExportFormat('XML');
            expect(exporter.getExtension()).toBe('xml');
        });

        it('sets plist extension for Cocos2d format', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            exporter.setExportFormat('Cocos2d');
            expect(exporter.getExtension()).toBe('plist');
        });

        it('supports custom template path', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('custom template');
            
            const result = exporter.setExportFormat('/custom/path/template.mst');
            expect(result).toBe(true);
        });
    });

    describe('getExtension', () => {
        it('returns default json extension', () => {
            expect(exporter.getExtension()).toBe('json');
        });

        it('returns extension set by format', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{name}}');
            
            exporter.setExportFormat('Spine');
            expect(exporter.getExtension()).toBe('atlas');
        });
    });

    describe('compile', () => {
        it('renders template with view data', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{"name": "{{meta.image}}"}');
            
            exporter.setExportFormat('JsonHash');
            
            const view: ExporterView = {
                spritesheets: [],
                meta: {
                    app: 'atlasify',
                    version: '1.0.0',
                    image: 'sprite.png',
                    format: 'RGBA8888',
                    size: { w: 1024, h: 1024 },
                    scale: '1',
                }
            };
            
            const result = exporter.compile(view);
            expect(result).toBe('{"name": "sprite.png"}');
        });

        it('uses default template when none set', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('default: {{meta.app}}');
            
            const view: ExporterView = {
                spritesheets: [],
                meta: {
                    app: 'atlasify',
                    version: '1.0.0',
                    image: 'sprite.png',
                    format: 'RGBA8888',
                    size: { w: 1024, h: 1024 },
                    scale: '1',
                }
            };
            
            const result = exporter.compile(view);
            expect(result).toBe('default: atlasify');
        });

        it('renders spritesheet data', () => {
            vi.mocked(existsSync).mockReturnValue(true);
            vi.mocked(readFileSync).mockReturnValue('{{#spritesheets}}{{name}}{{/spritesheets}}');
            
            exporter.setExportFormat('JsonHash');
            
            const view: ExporterView = {
                spritesheets: [{ name: 'sprite1' }, { name: 'sprite2' }],
                meta: {
                    app: 'atlasify',
                    version: '1.0.0',
                    image: 'sprite.png',
                    format: 'RGBA8888',
                    size: { w: 1024, h: 1024 },
                    scale: '1',
                }
            };
            
            const result = exporter.compile(view);
            expect(result).toBe('sprite1sprite2');
        });
    });
});
