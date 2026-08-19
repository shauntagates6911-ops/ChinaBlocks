import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * 🐉 CHINA-BLOCKS 1.0 INTEGRATED SAVER & VM HOOK 🐉
 * Combines scratch-vm JSON metadata injection + scratch-gui file export
 */
class ChinaBlocksExporter {
    constructor(vm) {
        this.vm = vm;
        this.extension = '.chinablocks1';
        this.mimeType = 'application/x.scratch.sb3';
    }

    /**
     * Intercepts standard VM JSON generation and adds custom metadata
     */
    generateChinaBlocksJson() {
        // Pull project JSON directly from Scratch VM
        const rawJson = this.vm.toJSON();
        const projectData = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

        // Wire ChinaBlocks metadata into project.json structure
        projectData.meta = {
            ...projectData.meta,
            semver: '3.0.0',
            vm: '0.2.0-chinablocks1',
            agent: 'ChinaBlocks Editor 1.0 🇨🇳',
            generator: 'ChinaBlocks Studio',
            platform: 'ChinaBlocks Engine'
        };

        return JSON.stringify(projectData);
    }

    /**
     * Packs project JSON and all VM runtime assets into a custom .chinablocks1 file
     * @param {string} filename - Base name for the project file
     */
    async exportProject(filename = 'Project') {
        const zip = new JSZip();

        // 1. Inject modified project.json
        const modifiedJson = this.generateChinaBlocksJson();
        zip.file('project.json', modifiedJson);

        // 2. Fetch and append all assets (costumes, sounds) from scratch-vm storage
        const assets = this.vm.assets || [];
        assets.forEach(asset => {
            const fileName = `${asset.assetId}.${asset.dataFormat}`;
            zip.file(fileName, asset.data);
        });

        // 3. Compress into blob
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // 4. Download file with .chinablocks1 extension
        const fullFilename = filename.endsWith(this.extension) 
            ? filename 
            : `${filename}${this.extension}`;

        saveAs(content, fullFilename);
        console.log(` Saved project as ${fullFilename}! 🇨🇳✨`);
    }

    /**
     * Wire auto-save hook directly into scratch-vm runtime
     */
    wireIntoVM() {
        // Intercept standard sb3 export call
        const originalSave = this.vm.saveProjectSb3.bind(this.vm);
        
        this.vm.saveProjectSb3 = async () => {
            console.log('🔄 Intercepting standard .sb3 call -> Exporting .chinablocks1...');
            return this.exportProject('ChinaBlocks_Project');
        };

        // Inject custom file loader listener for .chinablocks1
        this.vm.loadChinaBlocksProject = async (fileData) => {
            // JSZip decompresses .chinablocks1 back into scratch-vm standard reader
            return this.vm.loadProject(fileData);
        };
    }
}

// 🛠️ INITIALIZATION & HOOK SETUP
// Attach to active Scratch VM instance
if (window.vm) {
    const chinaBlocksEngine = new ChinaBlocksExporter(window.vm);
    chinaBlocksEngine.wireIntoVM();
    window.ChinaBlocksExporter = chinaBlocksEngine;
    console.log(' ChinaBlocks1 engine successfully wired to VM!');
}
