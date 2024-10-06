import { Mutex } from 'async-mutex';
import fs from 'fs';

class SharedResource {
    constructor() {
        this.mutex = new Mutex();
        this.logMutex = new Mutex();
        // this.datTimeMutex = new Mutex();
        this.data = {}; // Shared resource as an object
        // this.dateTime = {};
    }
    async logError(message) {
        this.logMutex
            .runExclusive(() => {
                fs.appendFileSync('logfile.log', `${new Date().toISOString()}: ${message}\n`);
            })
            .catch((err) => console.error(err));
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
    // async getDateTimeID(dateTime) {
    //     const release = await this.datTimeMutex.acquire();
    //     try {
    //         return this.dateTime[dateTime];
    //     } finally {
    //         release();
    //     }
    // }
    // async setDateTimeData(data) {
    //     const release = await this.datTimeMutex.acquire();
    //     try {
    //         this.dateTime = data;
    //     } finally {
    //         release();
    //     }
    // }
}

const sharedResource = new SharedResource();
export default sharedResource;
