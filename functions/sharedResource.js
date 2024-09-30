import { Mutex } from 'async-mutex';

class SharedResource {
    constructor() {
        this.mutex = new Mutex();
        this.data = {}; // Shared resource as an object
    }

    async addKeyValue(key, value) {
        const release = await this.mutex.acquire();
        try {
            // Add or update the key-value pair
            this.data[key] = value;
            // console.log(`Added/Updated: ${key} = ${value}`);
        } finally {
            release();
        }
    }

    async getValue(key) {
        const release = await this.mutex.acquire();
        try {
            // Return the value associated with the key
            return this.data[key];
        } finally {
            release();
        }
    }

    async getAll() {
        const release = await this.mutex.acquire();
        try {
            // Return the entire object
            return { ...this.data }; // Return a shallow copy
        } finally {
            release();
        }
    }
}

const sharedResource = new SharedResource();
export default sharedResource;
