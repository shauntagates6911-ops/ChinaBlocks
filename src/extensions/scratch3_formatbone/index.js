const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class Scratch3Formatbone {
    constructor (runtime) {
        this.runtime = runtime;
        this.store = {}; // Holds in-memory JSON objects
    }

    getInfo () {
        return {
            id: 'formatbone',
            name: 'JSON Formatbone 🦴',
            color1: '#2C3E50',
            color2: '#1A252F',
            blocks: [
                {
                    opcode: 'createObject',
                    blockType: BlockType.COMMAND,
                    text: 'create JSON object [NAME]',
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: 'myJson' }
                    }
                },
                {
                    opcode: 'setKey',
                    blockType: BlockType.COMMAND,
                    text: 'in JSON [NAME] set key [KEY] to value [VALUE]',
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: 'myJson' },
                        KEY: { type: ArgumentType.STRING, defaultValue: 'status' },
                        VALUE: { type: ArgumentType.STRING, defaultValue: 'ready' }
                    }
                },
                {
                    opcode: 'getValue',
                    blockType: BlockType.REPORTER,
                    text: 'get key [KEY] from JSON [NAME]',
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: 'myJson' },
                        KEY: { type: ArgumentType.STRING, defaultValue: 'status' }
                    }
                },
                {
                    opcode: 'stringify',
                    blockType: BlockType.REPORTER,
                    text: 'export JSON [NAME] as text',
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: 'myJson' }
                    }
                },
                {
                    opcode: 'parseJson',
                    blockType: BlockType.COMMAND,
                    text: 'load JSON string [STR] into object [NAME]',
                    arguments: {
                        STR: { type: ArgumentType.STRING, defaultValue: '{"key":"value"}' },
                        NAME: { type: ArgumentType.STRING, defaultValue: 'myJson' }
                    }
                }
            ]
        };
    }

    createObject (args) {
        this.store[args.NAME] = {};
    }

    setKey (args) {
        if (!this.store[args.NAME]) this.store[args.NAME] = {};
        
        // Auto-detect numbers vs strings
        let val = args.VALUE;
        if (!isNaN(val) && val.trim() !== '') val = Number(val);

        this.store[args.NAME][args.KEY] = val;
    }

    getValue (args) {
        if (!this.store[args.NAME]) return '';
        const res = this.store[args.NAME][args.KEY];
        return typeof res === 'object' ? JSON.stringify(res) : (res ?? '');
    }

    stringify (args) {
        return JSON.stringify(this.store[args.NAME] || {});
    }

    parseJson (args) {
        try {
            this.store[args.NAME] = JSON.parse(args.STR);
        } catch (e) {
            console.error('Formatbone JSON Parse Error:', e);
            this.store[args.NAME] = {};
        }
    }
}

module.exports = Scratch3Formatbone;
